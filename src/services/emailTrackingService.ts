import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../stores/firestore';

export interface EmailCampaign {
  id?: string;
  jobId: string;
  campaignName: string;
  subject: string;
  templateId?: string;
  totalRecipients: number;
  sentCount: number;
  successCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  status: 'sending' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  createdBy?: string;
  createdAt: Date;
}

export interface EmailRecipient {
  id?: string;
  campaignId: string;
  jobId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bounced: boolean;
  error?: string;
  messageId?: string;
  createdAt: Date;
}

const CAMPAIGNS_COLLECTION = 'emailCampaigns';
const RECIPIENTS_COLLECTION = 'emailRecipients';

export const emailTrackingService = {
  // Create a new email campaign record
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
        ...campaign,
        createdAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Update campaign statistics
  async updateCampaign(campaignId: string, updates: Partial<EmailCampaign>): Promise<void> {
    try {
      const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
      const updateData: any = { ...updates };
      
      // Convert Date objects to Timestamps
      if (updates.startTime) {
        updateData.startTime = Timestamp.fromDate(updates.startTime);
      }
      if (updates.endTime) {
        updateData.endTime = Timestamp.fromDate(updates.endTime);
      }
      
      await updateDoc(campaignRef, updateData);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Add email recipient record
  async addRecipient(recipient: Omit<EmailRecipient, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, RECIPIENTS_COLLECTION), {
        ...recipient,
        createdAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding recipient:', error);
      throw error;
    }
  },

  // Batch add multiple recipients
  async addRecipients(recipients: Omit<EmailRecipient, 'id' | 'createdAt'>[]): Promise<void> {
    try {
      const batch = recipients.map(recipient => 
        addDoc(collection(db, RECIPIENTS_COLLECTION), {
          ...recipient,
          createdAt: Timestamp.fromDate(new Date())
        })
      );
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error adding recipients:', error);
      throw error;
    }
  },

  // Update recipient status
  async updateRecipientStatus(
    jobId: string, 
    email: string, 
    updates: Partial<EmailRecipient>
  ): Promise<void> {
    try {
      // Find the recipient by jobId and email
      const q = query(
        collection(db, RECIPIENTS_COLLECTION),
        where('jobId', '==', jobId),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const recipientDoc = querySnapshot.docs[0];
        const updateData: any = { ...updates };
        
        // Convert Date objects to Timestamps
        if (updates.sentAt) {
          updateData.sentAt = Timestamp.fromDate(updates.sentAt);
        }
        if (updates.openedAt) {
          updateData.openedAt = Timestamp.fromDate(updates.openedAt);
        }
        if (updates.clickedAt) {
          updateData.clickedAt = Timestamp.fromDate(updates.clickedAt);
        }
        
        await updateDoc(recipientDoc.ref, updateData);
      }
    } catch (error) {
      console.error('Error updating recipient status:', error);
      throw error;
    }
  },

  // Get campaign statistics
  async getCampaignStats(campaignId: string): Promise<EmailCampaign | null> {
    try {
      const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
      const campaignDoc = await getDocs(query(collection(db, CAMPAIGNS_COLLECTION), where('__name__', '==', campaignId)));
      
      if (!campaignDoc.empty) {
        const data = campaignDoc.docs[0].data();
        return {
          id: campaignDoc.docs[0].id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as EmailCampaign;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw error;
    }
  },

  // Get recipients for a campaign
  async getCampaignRecipients(jobId: string): Promise<EmailRecipient[]> {
    try {
      const q = query(
        collection(db, RECIPIENTS_COLLECTION),
        where('jobId', '==', jobId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate(),
        openedAt: doc.data().openedAt?.toDate(),
        clickedAt: doc.data().clickedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      } as EmailRecipient));
    } catch (error) {
      console.error('Error getting campaign recipients:', error);
      throw error;
    }
  },

  // Get all campaigns
  async getAllCampaigns(): Promise<EmailCampaign[]> {
    try {
      const q = query(collection(db, CAMPAIGNS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      } as EmailCampaign));
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw error;
    }
  },

  // Track email open
  async trackEmailOpen(jobId: string, email: string): Promise<void> {
    try {
      await this.updateRecipientStatus(jobId, email, {
        openedAt: new Date()
      });
      
      // Update campaign open count
      await this.incrementCampaignStat(jobId, 'openedCount');
    } catch (error) {
      console.error('Error tracking email open:', error);
      throw error;
    }
  },

  // Track email click
  async trackEmailClick(jobId: string, email: string): Promise<void> {
    try {
      await this.updateRecipientStatus(jobId, email, {
        clickedAt: new Date()
      });
      
      // Update campaign click count
      await this.incrementCampaignStat(jobId, 'clickedCount');
    } catch (error) {
      console.error('Error tracking email click:', error);
      throw error;
    }
  },

  // Increment campaign statistic
  async incrementCampaignStat(jobId: string, statField: keyof EmailCampaign): Promise<void> {
    try {
      const q = query(
        collection(db, CAMPAIGNS_COLLECTION),
        where('jobId', '==', jobId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const campaignDoc = querySnapshot.docs[0];
        const currentData = campaignDoc.data();
        const currentValue = (currentData[statField] as number) || 0;
        
        await updateDoc(campaignDoc.ref, {
          [statField]: currentValue + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing campaign stat:', error);
      throw error;
    }
  }
};

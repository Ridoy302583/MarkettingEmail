import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { EmailTemplate } from '../types/EmailTemplate';
import { db } from '../stores/firestore';

const COLLECTION_NAME = 'emailTemplates';

export const emailTemplateService = {
  // Create a new email template
  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...template,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Get all email templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('lastModified', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmailTemplate));
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Update an email template
  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(templateRef, {
        ...updates,
        lastModified: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete an email template
  async deleteTemplate(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Increment usage count
  async incrementUsage(id: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION_NAME, id);
      const template = await this.getTemplates();
      const currentTemplate = template.find(t => t.id === id);
      if (currentTemplate) {
        await updateDoc(templateRef, {
          usageCount: currentTemplate.usageCount + 1,
          lastModified: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }
};

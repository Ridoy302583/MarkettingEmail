// hooks/useCampaignActions.ts

import { useCampaignStore } from '../stores/campaignStore';
import { useContacts } from './useContacts';
import { emailService } from '../services/emailService';
import { emailTrackingService } from '../services/emailTrackingService';

export const useCampaignActions = () => {
  const {
    selectedTemplate,
    setSendingStatus,
    setSendResult,
    setCurrentJobId,
    setEmailProgress,
    setEmailQueue,
    setRealtimeLog,
    resetCampaignState
  } = useCampaignStore();

  const { getSelectedContactsData } = useContacts();

  const handleSendCampaign = async () => {
    console.log('🚀 handleSendCampaign called');
    
    const selectedContactsData = getSelectedContactsData();
    
    if (!selectedTemplate || selectedContactsData.length === 0) {
      console.log('❌ Missing template or contacts');
      return;
    }

    // Reset job state
    setCurrentJobId(null);
    setEmailProgress({
      total: 0,
      sent: 0,
      success: 0,
      failed: 0,
      pending: 0,
      emailsPerSecond: 0,
      startTime: null,
      estimatedCompletion: null,
      currentBatch: 0,
      totalBatches: 0
    });
    setEmailQueue({
      currentBatch: [],
      nextBatch: [],
      allEmails: new Map()
    });
    setRealtimeLog([]);

    const jobId = `campaign_${Date.now()}`;
    console.log('🚀 Generated new jobId:', jobId);
    
    setSendingStatus('sending');
    
    try {
      // Create campaign record in Firebase
      const campaignId = await emailTrackingService.createCampaign({
        jobId,
        campaignName: selectedTemplate.name || 'Untitled Campaign',
        subject: selectedTemplate.subject,
        templateId: selectedTemplate.id?.toString(),
        totalRecipients: selectedContactsData.length,
        sentCount: 0,
        successCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
        status: 'sending',
        startTime: new Date()
      });

      console.log('📊 Campaign created in Firebase:', campaignId);

      // Add recipients to Firebase
      const recipients = selectedContactsData.map(contact => ({
        campaignId,
        jobId,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        status: 'pending' as const,
        bounced: false
      }));

      await emailTrackingService.addRecipients(recipients);
      console.log('📊 Recipients added to Firebase:', recipients.length);

      const payload = {
        jobId,
        contacts: selectedContactsData,
        subject: selectedTemplate.subject,
        html: selectedTemplate.html,
        from: 'noreply@websparks.ai',
        batchSize: 50,
        delayBetweenBatches: 500
      };
      
      const result = await emailService.sendBulkCampaign(payload);
      console.log('📧 Backend response:', result);

      if (!result.success) {
        // Update campaign status to failed in Firebase
        await emailTrackingService.updateCampaign(campaignId, {
          status: 'failed',
          endTime: new Date()
        });

        setSendResult(result);
        setSendingStatus('error');
      }
    } catch (error) {
      console.error('❌ Campaign error:', error);
      setSendingStatus('error');
      setSendResult({ 
        success: false, 
        message: 'Failed to send campaign: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  };

  const handlePauseCampaign = () => {
    setSendingStatus('paused');
  };

  const handleResumeCampaign = () => {
    setSendingStatus('sending');
  };

  const handleStopCampaign = () => {
    setSendingStatus('idle');
    setCurrentJobId(null);
    setEmailProgress({
      total: 0,
      sent: 0,
      success: 0,
      failed: 0,
      pending: 0,
      emailsPerSecond: 0,
      startTime: null,
      estimatedCompletion: null,
      currentBatch: 0,
      totalBatches: 0
    });
    setEmailQueue({
      currentBatch: [],
      nextBatch: [],
      allEmails: new Map()
    });
    setRealtimeLog([]);
  };

  return {
    handleSendCampaign,
    handlePauseCampaign,
    handleResumeCampaign,
    handleStopCampaign,
    resetCampaignState
  };
};

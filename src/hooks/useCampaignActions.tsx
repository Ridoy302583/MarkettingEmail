// hooks/useCampaignActions.ts

import { useCampaignStore } from '../stores/campaignStore';
import { useContacts } from './useContacts';
import { emailService } from '../services/emailService';

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
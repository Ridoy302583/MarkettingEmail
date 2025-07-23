// hooks/useWebSocket.ts

import { useEffect, useRef } from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { WebSocketMessage } from '../types/campaign.types';

export const useWebSocket = (isActive: boolean) => {
  const wsRef = useRef<WebSocket | null>(null);
  const currentJobIdRef = useRef<string | null>(null);
  
  const {
    currentJobId,
    setCurrentJobId,
    setIsConnected,
    setEmailProgress,
    setEmailQueue,
    setRealtimeLog,
    setSendingStatus,
    setSendResult,
    updateEmailProgress,
    updateEmailQueue,
    selectedContacts,
    contacts
  } = useCampaignStore();

  const getSelectedContactsData = () => {
    return contacts
      .filter(contact => selectedContacts.includes(contact.id))
      .map(contact => {
        const nameParts = contact.fullName ? contact.fullName.split(' ') : [];
        return {
          email: contact.email,
          firstName: contact.firstName || nameParts[0] || '',
          lastName: contact.lastName || nameParts.slice(1).join(' ') || ''
        };
      });
  };

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    console.log('🔥 RAW WebSocket message received:', data);
    console.log('🔍 Current jobId (ref):', currentJobIdRef.current);
    console.log('🔍 Current jobId (state):', currentJobId);
    console.log('🔍 Message jobId:', data.jobId);
    
    // If currentJobId is null and we get a job_started message, set it
    if (!currentJobIdRef.current && data.type === 'job_started' && data.jobId) {
      console.log('🔧 Setting currentJobId from job_started:', data.jobId);
      currentJobIdRef.current = data.jobId;
      setCurrentJobId(data.jobId);
    }
    
    // Use ref for immediate comparison
    if (currentJobIdRef.current === data.jobId || (!currentJobIdRef.current && data.type === 'job_started')) {
      console.log('✅ Processing message type:', data.type);
      
      switch (data.type) {
        case 'job_started':
          if (!currentJobIdRef.current) {
            currentJobIdRef.current = data.jobId;
            setCurrentJobId(data.jobId);
          }
          
          if (data.job) {
            setEmailProgress({
              total: data.job.totalEmails,
              sent: 0,
              success: 0,
              failed: 0,
              pending: data.job.totalEmails,
              emailsPerSecond: 0,
              startTime: new Date(data.job.startTime),
              estimatedCompletion: null,
              currentBatch: 0,
              totalBatches: data.job.totalBatches || 0
            });
          }
          
          // Initialize the email queue with all emails as pending
          const selectedEmails = getSelectedContactsData().map(c => c.email);
          const allEmailsMap = new Map();
          selectedEmails.forEach(email => {
            allEmailsMap.set(email, {
              email,
              status: 'pending',
              timestamp: undefined
            });
          });
          
          setEmailQueue({
            currentBatch: [],
            nextBatch: [],
            allEmails: allEmailsMap
          });
          setRealtimeLog([]);
          break;
          
        case 'email_sending':
          if (data.email && data.timestamp) {
            updateEmailQueue(data.email, {
              status: 'sending',
              timestamp: data.timestamp
            });
            
            // Add to real-time log
            setRealtimeLog(prev => [{
              email: data.email,
              status: 'sending',
              timestamp: new Date(data.timestamp!)
            }, ...prev].slice(0, 100));
          }
          break;
          
        case 'email_sent':
        case 'email_failed':
          if (data.email && data.timestamp) {
            updateEmailQueue(data.email, {
              status: data.type === 'email_sent' ? 'sent' : 'failed',
              timestamp: data.timestamp,
              error: data.error
            });

            if (data.progress) {
              updateEmailProgress(data);
            }
            
            // Add to real-time log
            setRealtimeLog(prev => [{
              email: data.email,
              status: data.type === 'email_sent' ? 'sent' : 'failed',
              timestamp: new Date(data.timestamp),
              error: data.error
            }, ...prev].slice(0, 100));
          }
          break;
          
        case 'job_completed':
          setSendingStatus('completed');
          if (data.results) {
            setSendResult({
              success: true,
              message: `Campaign completed: ${data.results.successful} successful, ${data.results.failed} failed`,
              stats: data.results
            });
          }
          
          setTimeout(() => {
            if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
              setIsConnected(false);
            }
          }, 5000);
          break;
          
        case 'job_failed':
          setSendingStatus('error');
          setSendResult({
            success: false,
            message: data.error || 'Campaign failed'
          });
          break;
      }
    } else {
      console.log('❌ JobId mismatch - ignoring message');
    }
  };

  const initializeWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        wsRef.current = ws;
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      initializeWebSocket();
    } else {
      closeWebSocket();
    }

    return () => {
      closeWebSocket();
    };
  }, [isActive]);

  // Update ref when state changes
  useEffect(() => {
    currentJobIdRef.current = currentJobId;
  }, [currentJobId]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    closeWebSocket
  };
};
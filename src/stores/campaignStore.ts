// stores/campaignStore.ts

import { create } from 'zustand';
import { CampaignState, Contact, EmailProgress, EmailQueue, ContactFilters } from '../types/campaign.types';

interface CampaignStore extends CampaignState {
  // Actions
  setSearchTerm: (term: string) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowSendModal: (show: boolean) => void;
  setSelectedTemplate: (template: any) => void;
  setSendingStatus: (status: CampaignState['sendingStatus']) => void;
  setSendResult: (result: any) => void;
  setCurrentJobId: (id: string | null) => void;
  setEmailProgress: (progress: Partial<EmailProgress>) => void;
  setEmailQueue: (queue: Partial<EmailQueue>) => void;
  setRealtimeLog: (log: any[]) => void;
  setIsConnected: (connected: boolean) => void;
  setContacts: (contacts: Contact[]) => void;
  setAllContacts: (contacts: Contact[]) => void;
  setSelectedContacts: (contacts: number[]) => void;
  setLoadingContacts: (loading: boolean) => void;
  setContactsError: (error: string | null) => void;
  setContactSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<ContactFilters>) => void;
  
  // Complex actions
  resetCampaignState: () => void;
  updateEmailProgress: (data: any) => void;
  updateEmailQueue: (email: string, status: any) => void;
}

const initialEmailProgress: EmailProgress = {
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
};

const initialEmailQueue: EmailQueue = {
  currentBatch: [],
  nextBatch: [],
  allEmails: new Map()
};

const initialFilters: ContactFilters = {
  emailVerified: 'all',
  registerType: 'all',
  accountType: 'all',
  lastLogin: 'all',
  status: 'all',
  planName: 'all'
};

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  // Initial state
  searchTerm: '',
  showCreateModal: false,
  showSendModal: false,
  selectedTemplate: null,
  sendingStatus: 'idle',
  sendResult: null,
  currentJobId: null,
  emailProgress: initialEmailProgress,
  emailQueue: initialEmailQueue,
  realtimeLog: [],
  isConnected: false,
  contacts: [],
  allContacts: [],
  selectedContacts: [],
  loadingContacts: false,
  contactsError: null,
  contactSearchTerm: '',
  filters: initialFilters,

  // Simple setters
  setSearchTerm: (term) => set({ searchTerm: term }),
  setShowCreateModal: (show) => set({ showCreateModal: show }),
  setShowSendModal: (show) => set({ showSendModal: show }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setSendingStatus: (status) => set({ sendingStatus: status }),
  setSendResult: (result) => set({ sendResult: result }),
  setCurrentJobId: (id) => set({ currentJobId: id }),
  setRealtimeLog: (log) => set({ realtimeLog: log }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setContacts: (contacts) => set({ contacts }),
  setAllContacts: (contacts) => set({ allContacts: contacts }),
  setSelectedContacts: (contacts) => set({ selectedContacts: contacts }),
  setLoadingContacts: (loading) => set({ loadingContacts: loading }),
  setContactsError: (error) => set({ contactsError: error }),
  setContactSearchTerm: (term) => set({ contactSearchTerm: term }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  setEmailProgress: (progress) => set((state) => ({
    emailProgress: { ...state.emailProgress, ...progress }
  })),

  setEmailQueue: (queue) => set((state) => ({
    emailQueue: { ...state.emailQueue, ...queue }
  })),

  // Complex actions
  resetCampaignState: () => set({
    showSendModal: false,
    sendingStatus: 'idle',
    selectedTemplate: null,
    sendResult: null,
    selectedContacts: [],
    contactSearchTerm: '',
    currentJobId: null,
    emailProgress: initialEmailProgress,
    emailQueue: initialEmailQueue,
    realtimeLog: [],
    isConnected: false
  }),

  updateEmailProgress: (data) => set((state) => ({
    emailProgress: {
      ...state.emailProgress,
      sent: data.progress.sent,
      success: data.progress.success,
      failed: data.progress.failed,
      pending: data.progress.pending,
      emailsPerSecond: data.progress.rate || 0
    }
  })),

  updateEmailQueue: (email, statusData) => set((state) => {
    const newAllEmails = new Map(state.emailQueue.allEmails);
    newAllEmails.set(email, {
      email,
      status: statusData.status,
      timestamp: statusData.timestamp ? new Date(statusData.timestamp) : undefined,
      error: statusData.error
    });
    
    return {
      emailQueue: {
        ...state.emailQueue,
        allEmails: newAllEmails
      }
    };
  })
}));

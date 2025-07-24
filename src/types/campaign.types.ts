// types/campaign.types.ts

export interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledDate?: string;
  createdDate: string;
}

export interface ApiContact {
  id: number;
  full_name: string;
  profile_pic?: string;
  email: string;
  role: string;
  register_type: string;
  email_verified: boolean;
  status: string;
  created_at: string;
  last_login?: string;
  plan_name?: string;
}

export interface Contact {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  profilePic?: string;
  role: string;
  registerType: string;
  emailVerified: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  planName?: string;
}

export interface EmailStatus {
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'queued';
  timestamp?: Date;
  error?: string;
  retryCount?: number;
  batchId?: string;
}

export interface EmailQueue {
  currentBatch: EmailStatus[];
  nextBatch: EmailStatus[];
  allEmails: Map<string, EmailStatus>;
}

export interface EmailProgress {
  total: number;
  sent: number;
  success: number;
  failed: number;
  pending: number;
  emailsPerSecond: number;
  startTime: Date | null;
  estimatedCompletion: Date | null;
  currentBatch: number;
  totalBatches: number;
}

export interface ContactFilters {
  emailVerified: string;
  registerType: string;
  accountType: string;
  lastLogin: string;
  status: string;
  planName: string;
}

export interface CampaignState {
  searchTerm: string;
  showCreateModal: boolean;
  showSendModal: boolean;
  selectedTemplate: any | null;
  sendingStatus: 'idle' | 'sending' | 'success' | 'error' | 'paused' | 'completed';
  sendResult: any;
  currentJobId: string | null;
  emailProgress: EmailProgress;
  emailQueue: EmailQueue;
  realtimeLog: any[];
  isConnected: boolean;
  contacts: Contact[];
  allContacts: Contact[];
  selectedContacts: number[];
  loadingContacts: boolean;
  contactsError: string | null;
  contactSearchTerm: string;
  filters: ContactFilters;
}

export interface WebSocketMessage {
  type: 'job_started' | 'email_sending' | 'email_sent' | 'email_failed' | 'job_completed' | 'job_failed';
  jobId: string;
  email?: string;
  timestamp?: string;
  error?: string;
  progress?: {
    sent: number;
    success: number;
    failed: number;
    pending: number;
    rate?: number;
  };
  job?: {
    totalEmails: number;
    startTime: string;
    totalBatches?: number;
  };
  results?: {
    successful: number;
    failed: number;
    successCount?: number;
    failureCount?: number;
  };
}

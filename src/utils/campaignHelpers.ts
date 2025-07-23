// utils/campaignHelpers.ts

import { Campaign, EmailStatus } from '../types/campaign.types';

export const getStatusIcon = (status: Campaign['status']) => {
  switch (status) {
    case 'sent':
      return 'i-hugeicons:tick-02';
    case 'scheduled':
      return 'i-hugeicons:clock-01';
    case 'sending':
      return 'i-hugeicons:mail-01';
    case 'draft':
      return 'i-hugeicons:edit-02';
    default:
      return 'i-hugeicons:cancel-circle';
  }
};

export const getStatusColor = (status: Campaign['status']) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'sending':
      return 'bg-orange-100 text-orange-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};

export const getPlanBadgeStyle = (planName?: string) => {
  switch (planName) {
    case 'Free':
      return 'bg-gray-100 text-gray-800';
    case 'Starter':
      return 'bg-blue-100 text-blue-800';
    case 'Plus':
      return 'bg-purple-100 text-purple-800';
    case 'Pro':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getEmailStatusIcon = (status: EmailStatus['status']) => {
  switch (status) {
    case 'sent':
      return 'i-hugeicons:tick-02';
    case 'failed':
      return 'i-hugeicons:cancel-circle';
    case 'sending':
      return 'i-hugeicons:loading-03';
    case 'pending':
      return 'i-hugeicons:clock-01';
    case 'queued':
      return 'i-hugeicons:arrow-right-01';
    default:
      return 'i-hugeicons:clock-01';
  }
};

export const getEmailStatusColor = (status: EmailStatus['status']) => {
  switch (status) {
    case 'sent':
      return 'text-green-700 bg-green-50';
    case 'failed':
      return 'text-red-700 bg-red-50';
    case 'sending':
      return 'text-blue-700 bg-blue-50';
    case 'pending':
      return 'text-yellow-700 bg-yellow-50';
    case 'queued':
      return 'text-gray-700 bg-gray-50';
    default:
      return 'text-gray-700 bg-gray-50';
  }
};

export const calculateProgress = (sent: number, total: number) => {
  return total > 0 ? (sent / total) * 100 : 0;
};

export const formatDuration = (startTime: Date | null) => {
  if (!startTime) return '0:00';
  const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getEmailsByStatus = (allEmails: Map<string, EmailStatus>) => {
  const emailsByStatus = {
    pending: [] as EmailStatus[],
    sending: [] as EmailStatus[],
    sent: [] as EmailStatus[],
    failed: [] as EmailStatus[]
  };

  allEmails.forEach(email => {
    if (email.status === 'pending' || email.status === 'queued') {
      emailsByStatus.pending.push(email);
    } else if (email.status === 'sending') {
      emailsByStatus.sending.push(email);
    } else if (email.status === 'sent') {
      emailsByStatus.sent.push(email);
    } else if (email.status === 'failed') {
      emailsByStatus.failed.push(email);
    }
  });

  return emailsByStatus;
};

export const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Sale Newsletter',
    subject: '🏖️ Summer Sale - Up to 50% Off!',
    status: 'sent' as const,
    recipients: 2345,
    sent: 2345,
    opened: 1234,
    clicked: 89,
    createdDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Product Update Announcement',
    subject: 'Exciting New Features Just Released!',
    status: 'sent' as const,
    recipients: 3456,
    sent: 3456,
    opened: 1987,
    clicked: 156,
    createdDate: '2024-01-14'
  },
  {
    id: 3,
    name: 'Welcome Series - Part 1',
    subject: 'Welcome to our community! 👋',
    status: 'scheduled' as const,
    recipients: 567,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledDate: '2024-01-20',
    createdDate: '2024-01-13'
  },
  {
    id: 4,
    name: 'Monthly Newsletter Draft',
    subject: 'January Newsletter - What\'s New',
    status: 'draft' as const,
    recipients: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    createdDate: '2024-01-12'
  }
];
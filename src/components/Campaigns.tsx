import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Clock, 
  CheckCircle,
  XCircle,
  Edit3,
  Copy,
  Trash2,
  Send,
  Users,
  FileText,
  RefreshCw,
  User,
  AlertCircle,
  Activity,
  BarChart3,
  Pause,
  Square,
  Play,
  Loader,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { emailService, EmailContact } from '../services/emailService';
import { emailTemplates, EmailTemplate } from '../data/emailTemplates';

interface Campaign {
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

interface ApiContact {
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

interface Contact {
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

// Enhanced email tracking interface
interface EmailStatus {
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'queued';
  timestamp?: Date;
  error?: string;
  retryCount?: number;
  batchId?: string;
}

interface EmailQueue {
  currentBatch: EmailStatus[];
  nextBatch: EmailStatus[];
  allEmails: Map<string, EmailStatus>;
}

const Campaigns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'paused' | 'completed'>('idle');
  const [sendResult, setSendResult] = useState<any>(null);
  const currentJobIdRef = useRef<string | null>(null);
  
  // Enhanced real-time monitoring states
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [emailProgress, setEmailProgress] = useState({
    total: 0,
    sent: 0,
    success: 0,
    failed: 0,
    pending: 0,
    emailsPerSecond: 0,
    startTime: null as Date | null,
    estimatedCompletion: null as Date | null,
    currentBatch: 0,
    totalBatches: 0
  });
  
  // Enhanced email tracking
  const [emailQueue, setEmailQueue] = useState<EmailQueue>({
    currentBatch: [],
    nextBatch: [],
    allEmails: new Map()
  });
  
  const [realtimeLog, setRealtimeLog] = useState<any[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Real contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    emailVerified: 'all',
    registerType: 'all',
    accountType: 'all',
    lastLogin: 'all',
    status: 'all',
    planName: 'all'
  });

  const API_BASE_URL = 'https://api.websparks.ai';

  // Transform functions (unchanged)
  const transformApiContact = (apiContact: ApiContact): Contact => {
    const fullName = apiContact.full_name || '';
    const nameParts = fullName ? fullName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: apiContact.id,
      email: apiContact.email || '',
      firstName,
      lastName,
      fullName,
      profilePic: apiContact.profile_pic,
      role: apiContact.role || 'user',
      registerType: apiContact.register_type || 'general',
      emailVerified: apiContact.email_verified || false,
      status: (apiContact.status as 'active' | 'inactive' | 'pending') || 'pending',
      createdAt: apiContact.created_at || '',
      lastLogin: apiContact.last_login,
      planName: apiContact.plan_name,
    };
  };

  const transformPlanApiContact = (item: { plan: any; user: any }): Contact => {
    const user = item.user;
    const plan = item.plan;

    const fullName = user.full_name || '';
    const nameParts = fullName ? fullName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: user.id,
      email: user.email || '',
      firstName,
      lastName,
      fullName,
      profilePic: user.profile_pic,
      role: user.role || 'user',
      registerType: user.register_type || 'general',
      emailVerified: user.email_verified || false,
      status: (user.status as 'active' | 'inactive' | 'pending') || 'pending',
      createdAt: user.created_at || '',
      lastLogin: user.last_login,
      planName: plan.name || 'Unknown',
    };
  };

  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  // Fetch contacts function (unchanged)
  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      setContactsError(null);
      
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }
      
      let allContactsData: Contact[] = [];
      
      if (filters.planName !== 'all') {
        const url = `${API_BASE_URL}/get-user-by-plan-name/?page=1&per_page=3000&name=${filters.planName}&sort_by=id&sort_order=asc`;
        const response = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        const mappedContacts: Contact[] = data.map(transformPlanApiContact);
        const uniqueContacts: Contact[] = Array.from(
          new Map(mappedContacts.map(c => [c.id, c])).values()
        );
        allContactsData = uniqueContacts;
      } else {
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
          const url = `${API_BASE_URL}/users-all/?page=${currentPage}&per_page=100&sort_by=id&sort_order=dsc`;
          
          const response = await fetch(url, {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          let users = [];
          if (Array.isArray(data)) {
            users = data;
            hasMore = data.length === 100;
          } else if (data.users || data.data) {
            users = data.users || data.data;
            const totalPages = data.total_pages || Math.ceil((data.total || 0) / 100);
            hasMore = currentPage < totalPages;
          } else {
            hasMore = false;
          }
          
          const transformedContacts = users.map(transformApiContact);
          allContactsData = [...allContactsData, ...transformedContacts];
          
          currentPage++;
          
          if (currentPage > 50) {
            break;
          }
        }
      }
      
      setAllContacts(allContactsData);
      setContacts(allContactsData);
      
    } catch (err) {
      setContactsError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handlePlanFilterChange = (planName: string) => {
    setFilters(prev => ({ ...prev, planName }));
    setSelectedContacts([]);
  };

  // Initialize email queue when campaign starts
  const initializeEmailQueue = (selectedEmails: string[]) => {
    const allEmailsMap = new Map<string, EmailStatus>();
    
    selectedEmails.forEach(email => {
      allEmailsMap.set(email, {
        email,
        status: 'queued',
        timestamp: undefined,
        error: undefined,
        retryCount: 0
      });
    });

    setEmailQueue({
      currentBatch: [],
      nextBatch: [],
      allEmails: allEmailsMap
    });
  };

  // Enhanced WebSocket initialization
  useEffect(() => {
    if (showSendModal) {
      fetchContacts();
      initializeWebSocket();
    } else {
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
        setIsConnected(false);
      }
    }
  }, [showSendModal, filters.planName]);

  const initializeWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setWsConnection(null);
        
        // Auto-disconnect when campaign is completed
        if (sendingStatus === 'completed') {
          console.log('Campaign completed - WebSocket auto-disconnected');
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  // Enhanced WebSocket message handler
  // Update your handleWebSocketMessage function to be more flexible:
const handleWebSocketMessage = (data: any) => {
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
          
          // Initialize the email queue with all emails as pending
          const selectedEmails = getSelectedContactsData().map(c => c.email);
          const allEmailsMap = new Map<string, EmailStatus>();
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
          setEmailQueue(prev => {
            const newAllEmails = new Map(prev.allEmails);
            newAllEmails.set(data.email, {
              email: data.email,
              status: 'sending',
              timestamp: new Date(data.timestamp)
            });
            return { ...prev, allEmails: newAllEmails };
          });
          
          // Add to real-time log
          setRealtimeLog(prev => [{
            email: data.email,
            status: 'sending',
            timestamp: new Date(data.timestamp)
          }, ...prev].slice(0, 100));
          break;
          
        case 'email_sent':
        case 'email_failed':
          setEmailQueue(prev => {
            const newAllEmails = new Map(prev.allEmails);
            newAllEmails.set(data.email, {
              email: data.email,
              status: data.type === 'email_sent' ? 'sent' : 'failed',
              timestamp: new Date(data.timestamp),
              error: data.error
            });
            return { ...prev, allEmails: newAllEmails };
          });

          setEmailProgress(prev => ({
            ...prev,
            sent: data.progress.sent,
            success: data.progress.success,
            failed: data.progress.failed,
            pending: data.progress.pending,
            emailsPerSecond: data.progress.rate || 0
          }));
          
          // Add to real-time log
          setRealtimeLog(prev => [{
            email: data.email,
            status: data.type === 'email_sent' ? 'sent' : 'failed',
            timestamp: new Date(data.timestamp),
            error: data.error
          }, ...prev].slice(0, 100));
          break;
          
        case 'job_completed':
          setSendingStatus('completed');
          setSendResult({
            success: true,
            message: `Campaign completed: ${data.results.successful} successful, ${data.results.failed} failed`,
            stats: data.results
          });
          
          setTimeout(() => {
            if (wsConnection) {
              wsConnection.close();
              setWsConnection(null);
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
  // Get email status icon
  const getEmailStatusIcon = (status: EmailStatus['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'sending':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'queued':
        return <ArrowRight className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get email status color
  const getEmailStatusColor = (status: EmailStatus['status']) => {
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

  // Campaigns data (unchanged)
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: 'Summer Sale Newsletter',
      subject: '🏖️ Summer Sale - Up to 50% Off!',
      status: 'sent',
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
      status: 'sent',
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
      status: 'scheduled',
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
      status: 'draft',
      recipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      createdDate: '2024-01-12'
    }
  ];

  // Helper functions (unchanged)
  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'sending':
        return <Mail className="w-4 h-4 text-orange-500" />;
      case 'draft':
        return <Edit3 className="w-4 h-4 text-gray-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
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

  const getPlanBadgeStyle = (planName?: string) => {
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

  // Filter and selection functions (unchanged)
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applyFilters = () => {
    let filtered = [...allContacts];
    
    if (filters.emailVerified === 'verified') {
      filtered = filtered.filter(contact => contact.emailVerified);
    } else if (filters.emailVerified === 'not_verified') {
      filtered = filtered.filter(contact => !contact.emailVerified);
    }
    
    if (filters.registerType !== 'all') {
      filtered = filtered.filter(contact => contact.registerType === filters.registerType);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(contact => contact.status === filters.status);
    }
    
    if (filters.planName !== 'all' && allContacts.length > 0) {
      const hasMixedPlans = allContacts.some(contact => 
        contact.planName && contact.planName !== filters.planName
      );
      if (hasMixedPlans) {
        filtered = filtered.filter(contact => contact.planName === filters.planName);
      }
    }

    if (filters.lastLogin !== 'all') {
      const now = new Date();
      filtered = filtered.filter(contact => {
        if (!contact.lastLogin) {
          return filters.lastLogin === 'never';
        }
        
        const lastLoginDate = new Date(contact.lastLogin);
        const diffTime = now.getTime() - lastLoginDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.lastLogin) {
          case '7_days':
            return diffDays <= 7;
          case '30_days':
            return diffDays <= 30;
          case 'this_month':
            return lastLoginDate.getMonth() === now.getMonth() && lastLoginDate.getFullYear() === now.getFullYear();
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            return lastLoginDate.getMonth() === lastMonth.getMonth() && lastLoginDate.getFullYear() === lastMonth.getFullYear();
          default:
            return true;
        }
      });
    }
    
    setContacts(filtered);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    contact.fullName.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (allContacts.length > 0) {
      applyFilters();
    }
  }, [filters, allContacts]);

  useEffect(() => {
    setSelectedContacts([]);
  }, [filters]);

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  const getSelectedContactsData = (): EmailContact[] => {
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

  const handleSendCampaign = async () => {
    console.log('🚀 handleSendCampaign called');
    
    if (!selectedTemplate || selectedContacts.length === 0) {
      console.log('❌ Missing template or contacts');
      return;
    }

    // Reset job state
    currentJobIdRef.current = null;
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
      const selectedContactsData = getSelectedContactsData();
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
      setSendResult({ success: false, message: 'Failed to send campaign: ' + error.message });
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

  const calculateProgress = () => {
    return emailProgress.total > 0 ? (emailProgress.sent / emailProgress.total) * 100 : 0;
  };

  const formatDuration = (startTime: Date | null) => {
    if (!startTime) return '0:00';
    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get emails by status for detailed monitoring
  // const getEmailsByStatus = () => {
  //   const statusCounts = {
  //     sent: 0,
  //     failed: 0,
  //     sending: 0,
  //     pending: 0,
  //     queued: 0
  //   };

  //   const emailsByStatus = {
  //     sent: [] as EmailStatus[],
  //     failed: [] as EmailStatus[],
  //     sending: [] as EmailStatus[],
  //     pending: [] as EmailStatus[],
  //     queued: [] as EmailStatus[]
  //   };

  //   emailQueue.allEmails.forEach(email => {
  //     statusCounts[email.status]++;
  //     emailsByStatus[email.status].push(email);
  //   });

  //   return { statusCounts, emailsByStatus };
  // };
const resetCampaignState = () => {
  currentJobIdRef.current = null;
  setCurrentJobId(null);
  console.log('🔄 Resetting campaign state');
  setShowSendModal(false);
  setSendingStatus('idle');
  setSelectedTemplate(null);
  setSendResult(null);
  setSelectedContacts([]);
  setContactSearchTerm('');
  setCurrentJobId(null); // This is crucial!
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
  if (wsConnection) {
    wsConnection.close();
    setWsConnection(null);
    setIsConnected(false);
  }
};
const getEmailsByStatus = () => {
    const emailsByStatus = {
      pending: [] as EmailStatus[],
      sending: [] as EmailStatus[],
      sent: [] as EmailStatus[],
      failed: [] as EmailStatus[]
    };

    emailQueue.allEmails.forEach(email => {
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
  const emailsByStatus = getEmailsByStatus();
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-2">Create, manage, and track your email campaigns</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Campaign
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(campaign.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {campaign.recipients.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {campaign.status === 'sent' ? (
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">Opened: </span>
                            <span className="font-medium">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Clicked: </span>
                            <span className="font-medium">{((campaign.clicked / campaign.sent) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {campaign.scheduledDate ? (
                        <div>
                          <div className="text-sm">Scheduled:</div>
                          <div className="text-sm">{new Date(campaign.scheduledDate).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        new Date(campaign.createdDate).toLocaleDateString()
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Campaign Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-7xl mx-4 max-h-[95vh] flex relative">
            {/* Left Sidebar - Filters */}
            <div className={`${sendingStatus === 'sending' || sendingStatus === 'paused' ? 'w-64' : 'w-80'} border-r border-gray-200 p-6 overflow-y-auto`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Filter Recipients</h3>
              
              {/* Connection Status */}
              <div className={`flex items-center px-3 py-2 rounded-lg text-sm mb-4 ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              
              <div className="space-y-6">
                {/* Plan Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Type
                  </label>
                  <div className="space-y-2">
                    {['all', 'Free', 'Starter', 'Plus', 'Pro'].map((plan) => (
                      <label key={plan} className="flex items-center">
                        <input
                          type="radio"
                          name="planType"
                          value={plan}
                          checked={filters.planName === plan}
                          onChange={(e) => handlePlanFilterChange(e.target.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {plan === 'all' ? 'All Plans' : plan}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Email Verification Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'verified', label: 'Verified' },
                      { value: 'not_verified', label: 'Not Verified' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="emailStatus"
                          value={option.value}
                          checked={filters.emailVerified === option.value}
                          onChange={(e) => setFilters(prev => ({ ...prev, emailVerified: e.target.value }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Register Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Register Type
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Types' },
                      { value: 'github', label: 'GitHub' },
                      { value: 'google', label: 'Google' },
                      { value: 'general', label: 'General' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="registerType"
                          value={option.value}
                          checked={filters.registerType === option.value}
                          onChange={(e) => setFilters(prev => ({ ...prev, registerType: e.target.value }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Account Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Status' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'pending', label: 'Pending' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="accountStatus"
                          value={option.value}
                          checked={filters.status === option.value}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Last Login Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Login
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Time' },
                      { value: '7_days', label: 'Last 7 Days' },
                      { value: '30_days', label: 'Last 30 Days' },
                      { value: 'this_month', label: 'This Month' },
                      { value: 'last_month', label: 'Last Month' },
                      { value: 'never', label: 'Never Logged In' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="lastLogin"
                          value={option.value}
                          checked={filters.lastLogin === option.value}
                          onChange={(e) => setFilters(prev => ({ ...prev, lastLogin: e.target.value }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setFilters({
                      emailVerified: 'all',
                      registerType: 'all',
                      accountType: 'all',
                      lastLogin: 'all',
                      status: 'all',
                      planName: 'all'
                    })}
                    className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content - Contacts and Templates */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Send Email Campaign</h3>
                {sendingStatus === 'sending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePauseCampaign}
                      className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </button>
                    <button
                      onClick={handleStopCampaign}
                      className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      Stop
                    </button>
                  </div>
                )}
                {sendingStatus === 'paused' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleResumeCampaign}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </button>
                    <button
                      onClick={handleStopCampaign}
                      className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      Stop
                    </button>
                  </div>
                )}
              </div>
              
              {/* Real-time Progress Dashboard */}
              {(sendingStatus === 'sending' || sendingStatus === 'paused') && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Real-time Progress
                    </h4>
                    <div className="text-sm text-gray-600">
                      {emailProgress.emailsPerSecond} emails/sec • Duration: {formatDuration(emailProgress.startTime)}
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-900">{emailProgress.sent.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">Sent</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-900">{emailProgress.success.toLocaleString()}</div>
                      <div className="text-sm text-green-600">Success</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-900">{emailProgress.failed.toLocaleString()}</div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-900">{emailProgress.pending.toLocaleString()}</div>
                      <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm text-gray-500">{calculateProgress().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                    {emailProgress.totalBatches > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Batch {emailProgress.currentBatch} of {emailProgress.totalBatches}
                      </div>
                    )}
                  </div>

                  {/* Simple Email Progress List */}
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Progress ({emailQueue.allEmails.size} total)
                    </h5>
                    <div className="bg-white rounded-lg border max-h-64 overflow-y-auto">
                      {emailQueue.allEmails.size === 0 ? (
                        <p className="text-gray-500 text-center py-8">No emails in queue...</p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {Array.from(emailQueue.allEmails.values())
                            .sort((a, b) => {
                              // Sort by status: sending first, then sent, then failed, then pending
                              const statusOrder = { sending: 0, sent: 1, failed: 2, pending: 3, queued: 4 };
                              return statusOrder[a.status] - statusOrder[b.status];
                            })
                            .map((email, index) => (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                              <div className="flex items-center">
                                <span className="font-mono text-sm text-gray-700">{email.email}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  {getEmailStatusIcon(email.status)}
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEmailStatusColor(email.status)}`}>
                                    {email.status === 'sent' ? 'Success' : 
                                     email.status === 'failed' ? 'Failed' : 
                                     email.status === 'sending' ? 'Sending...' : 'Pending'}
                                  </span>
                                </div>
                                {email.timestamp && (
                                  <span className="text-xs text-gray-400 min-w-16">
                                    {email.timestamp.toLocaleTimeString()}
                                  </span>
                                )}
                                {!email.timestamp && email.status === 'pending' && (
                                  <span className="text-xs text-gray-400 min-w-16">Waiting...</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="mt-4 bg-white rounded-lg border p-4">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Performance Summary
                    </h5>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {emailProgress.sent > 0 ? ((emailProgress.success / emailProgress.sent) * 100).toFixed(1) : 0}%
                        </div>
                        <div className="text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {emailProgress.emailsPerSecond}
                        </div>
                        <div className="text-gray-600">Emails/Sec</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">
                          {emailProgress.pending > 0 && emailProgress.emailsPerSecond > 0 ? 
                            `~${Math.ceil(emailProgress.pending / emailProgress.emailsPerSecond)}s` : 
                            '-'
                          }
                        </div>
                        <div className="text-gray-600">ETA</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          sendingStatus === 'sending' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {sendingStatus === 'sending' ? 'Active' : 'Paused'}
                        </div>
                        <div className="text-gray-600">Status</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {sendingStatus === 'idle' && (
                <>
                  {/* Contacts Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Select Recipients ({allContacts.length} total, {filteredContacts.length} filtered)
                      </h4>
                      <button
                        onClick={fetchContacts}
                        disabled={loadingContacts}
                        className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${loadingContacts ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>

                    {loadingContacts && (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                        <span className="text-gray-600">Loading contacts...</span>
                      </div>
                    )}

                    {contactsError && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-red-600 text-sm">{contactsError}</p>
                          <button
                            onClick={() => {
                              console.log('Manual retry - Current token:', getAccessToken()?.substring(0, 20) + '...');
                              fetchContacts();
                            }}
                            className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    )}

                    {!loadingContacts && !contactsError && (
                      <>
                        {/* Contact Search */}
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search contacts..."
                            value={contactSearchTerm}
                            onChange={(e) => setContactSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Contacts List */}
                        <div className="border rounded-lg max-h-80 overflow-y-auto">
                          <div className="p-3 bg-gray-50 border-b sticky top-0">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                onChange={handleSelectAllContacts}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Select All ({filteredContacts.length} contacts)
                              </span>
                            </label>
                          </div>

                          {filteredContacts.length === 0 ? (
                            <div className="p-8 text-center">
                              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No contacts match your filters</p>
                              <p className="text-sm text-gray-400 mt-1">
                                Try adjusting your filter criteria in the left sidebar
                              </p>
                              {allContacts.length === 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Debug Help:</strong> Check the browser console (F12) for detailed error logs.
                                    <br />Current plan filter: <strong>{filters.planName}</strong>
                                    <br />API Token exists: <strong>{getAccessToken() ? 'Yes' : 'No'}</strong>
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {filteredContacts.map((contact) => (
                                <label
                                  key={contact.id}
                                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedContacts.includes(contact.id)}
                                    onChange={() => handleSelectContact(contact.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                                  />
                                  <div className="flex items-center flex-1">
                                    {contact.profilePic && (
                                      <img
                                        src={contact.profilePic}
                                        alt={contact.fullName}
                                        className="w-8 h-8 rounded-full mr-3"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 text-sm">
                                        {contact.fullName || 'No Name'}
                                      </div>
                                      <div className="text-sm text-gray-500">{contact.email}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {/* Plan Badge */}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeStyle(contact.planName)}`}>
                                      {contact.planName || 'Unknown'}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      contact.registerType === 'github' ? 'bg-gray-100 text-gray-800' :
                                      contact.registerType === 'google' ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {contact.registerType}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      contact.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {contact.role}
                                    </span>
                                    {contact.emailVerified ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" title="Email Verified" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-500" title="Email Not Verified" />
                                    )}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      contact.status === 'active' ? 'bg-green-100 text-green-800' :
                                      contact.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {contact.status}
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {selectedContacts.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>{selectedContacts.length}</strong> recipients selected
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Template Selection */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Select Template
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {emailTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate?.id === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h5 className="font-medium text-gray-900">{template.name}</h5>
                          <p className="text-sm text-gray-500">{template.subject}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                            template.category === 'promotional' ? 'bg-green-100 text-green-800' :
                            template.category === 'newsletter' ? 'bg-blue-100 text-blue-800' :
                            template.category === 'welcome' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {template.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {sendingStatus === 'sending' && emailProgress.total === 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Initializing campaign for {selectedContacts.length} recipients...</p>
                </div>
              )}

              {(sendingStatus === 'success' || sendingStatus === 'completed') && sendResult && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Campaign Completed Successfully!</h4>
                  <p className="text-gray-600 mb-4">{sendResult.message}</p>
                  {sendResult.stats && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ {sendResult.stats.successCount || sendResult.stats.successful} emails sent successfully<br/>
                        {(sendResult.stats.failureCount || sendResult.stats.failed) > 0 && 
                          `❌ ${sendResult.stats.failureCount || sendResult.stats.failed} emails failed`
                        }
                      </p>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    WebSocket will automatically disconnect in a few seconds...
                  </div>
                </div>
              )}

              {sendingStatus === 'error' && sendResult && (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Failed to Send Campaign</h4>
                  <p className="text-red-600">{sendResult.message}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    currentJobIdRef.current = null;
                    setShowSendModal(false);
                    setSendingStatus('idle');
                    setSelectedTemplate(null);
                    setSendResult(null);
                    setSelectedContacts([]);
                    setContactSearchTerm('');
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
                    if (wsConnection) {
                      wsConnection.close();
                      setWsConnection(null);
                      setIsConnected(false);
                    }
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sendingStatus === 'idle' ? 'Cancel' : 'Close'}
                </button>
                {sendingStatus === 'idle' && (
                  <button
                    onClick={handleSendCampaign}
                    disabled={!selectedTemplate || selectedContacts.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send to {selectedContacts.length} Recipients
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
// };

// export default Campaigns;
import React, { useState } from 'react';
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
  FileText
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

const Campaigns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sendResult, setSendResult] = useState<any>(null);

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

  // Sample contacts for demo
  const sampleContacts: EmailContact[] = [
    { email: 'mdallmamunofficial@gmail.com', firstName: 'Al Mamun', lastName: 'Official' },
    { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe' },
    { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith' },
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendCampaign = async () => {
    if (!selectedTemplate) return;

    setSendingStatus('sending');
    
    try {
      const result = await emailService.sendCampaign({
        contacts: sampleContacts,
        subject: selectedTemplate.subject,
        template: selectedTemplate.html,
        from: 'noreply@websparks.ai'
      });

      setSendResult(result);
      setSendingStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setSendingStatus('error');
      setSendResult({ success: false, message: 'Failed to send campaign' });
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-2">Create, manage, and track your email campaigns</p>
          </div>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Email Campaign</h3>
            
            {sendingStatus === 'idle' && (
              <>
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Recipients ({sampleContacts.length})
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {sampleContacts.map((contact, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {contact.firstName} {contact.lastName} - {contact.email}
                      </div>
                    ))}
                  </div>
                </div>

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

            {sendingStatus === 'sending' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Sending emails...</p>
              </div>
            )}

            {sendingStatus === 'success' && sendResult && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Campaign Sent Successfully!</h4>
                <p className="text-gray-600 mb-4">{sendResult.message}</p>
                {sendResult.stats && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ {sendResult.stats.successCount} emails sent successfully<br/>
                      {sendResult.stats.failureCount > 0 && `❌ ${sendResult.stats.failureCount} emails failed`}
                    </p>
                  </div>
                )}
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
                  setShowSendModal(false);
                  setSendingStatus('idle');
                  setSelectedTemplate(null);
                  setSendResult(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sendingStatus === 'idle' ? 'Cancel' : 'Close'}
              </button>
              {sendingStatus === 'idle' && (
                <button
                  onClick={handleSendCampaign}
                  disabled={!selectedTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
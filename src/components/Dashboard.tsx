import React, { useState, useEffect } from 'react';
import { emailTrackingService, EmailCampaign, EmailRecipient } from '../services/emailTrackingService';

interface DashboardStats {
  totalCampaigns: number;
  totalEmailsSent: number;
  totalSuccessful: number;
  totalFailed: number;
  averageOpenRate: number;
  averageClickRate: number;
  activeCampaigns: number;
  recentActivity: number;
}

interface RealtimeEmailStatus {
  email: string;
  status: 'sending' | 'sent' | 'failed';
  timestamp: Date;
  campaignName: string;
  error?: string;
}

const Dashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    totalEmailsSent: 0,
    totalSuccessful: 0,
    totalFailed: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    activeCampaigns: 0,
    recentActivity: 0
  });
  const [realtimeEmails, setRealtimeEmails] = useState<RealtimeEmailStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  const [wsConnected, setWsConnected] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001');
        
        ws.onopen = () => {
          console.log('Dashboard WebSocket connected');
          setWsConnected(true);
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // Handle real-time email updates
          if (data.type === 'email_sent' || data.type === 'email_failed' || data.type === 'email_sending') {
            const emailStatus: RealtimeEmailStatus = {
              email: data.email,
              status: data.type === 'email_sent' ? 'sent' : data.type === 'email_failed' ? 'failed' : 'sending',
              timestamp: new Date(data.timestamp),
              campaignName: data.campaignName || 'Unknown Campaign',
              error: data.error
            };
            
            setRealtimeEmails(prev => [emailStatus, ...prev].slice(0, 50)); // Keep last 50 emails
          }
          
          // Refresh stats when campaigns complete
          if (data.type === 'job_completed' || data.type === 'job_failed') {
            loadDashboardData();
          }
        };
        
        ws.onclose = () => {
          console.log('Dashboard WebSocket disconnected');
          setWsConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('Dashboard WebSocket error:', error);
          setWsConnected(false);
        };
        
        return ws;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        return null;
      }
    };

    const ws = connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load campaigns from Firebase
      const campaignData = await emailTrackingService.getAllCampaigns();
      setCampaigns(campaignData);
      
      // Calculate statistics
      const now = new Date();
      const timeframeDate = new Date();
      timeframeDate.setDate(now.getDate() - parseInt(selectedTimeframe));
      
      const filteredCampaigns = campaignData.filter(campaign => 
        campaign.startTime >= timeframeDate
      );
      
      const totalCampaigns = filteredCampaigns.length;
      const totalEmailsSent = filteredCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
      const totalSuccessful = filteredCampaigns.reduce((sum, c) => sum + c.successCount, 0);
      const totalFailed = filteredCampaigns.reduce((sum, c) => sum + c.failedCount, 0);
      const totalOpened = filteredCampaigns.reduce((sum, c) => sum + c.openedCount, 0);
      const totalClicked = filteredCampaigns.reduce((sum, c) => sum + c.clickedCount, 0);
      
      const averageOpenRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
      const averageClickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;
      const activeCampaigns = filteredCampaigns.filter(c => c.status === 'sending').length;
      
      // Recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const recentActivity = campaignData.filter(c => c.startTime >= yesterday).length;
      
      setStats({
        totalCampaigns,
        totalEmailsSent,
        totalSuccessful,
        totalFailed,
        averageOpenRate,
        averageClickRate,
        activeCampaigns,
        recentActivity
      });
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const getStatusIcon = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'completed':
        return <div className="i-hugeicons:tick-02 w-4 h-4 text-green-500" />;
      case 'sending':
        return <div className="i-hugeicons:loading-03 w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <div className="i-hugeicons:cancel-circle w-4 h-4 text-red-500" />;
      case 'paused':
        return <div className="i-hugeicons:pause w-4 h-4 text-yellow-500" />;
      default:
        return <div className="i-hugeicons:clock-01 w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="i-hugeicons:loading-03 w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="i-hugeicons:cancel-circle w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      label: 'Total Campaigns',
      value: stats.totalCampaigns.toString(),
      change: '+12%',
      trend: 'up',
      icon: 'i-hugeicons:mail-01',
      color: 'blue'
    },
    {
      label: 'Emails Sent',
      value: stats.totalEmailsSent.toLocaleString(),
      change: `${stats.totalSuccessful}/${stats.totalEmailsSent}`,
      trend: 'up',
      icon: 'i-hugeicons:sent',
      color: 'green'
    },
    {
      label: 'Success Rate',
      value: stats.totalEmailsSent > 0 ? `${((stats.totalSuccessful / stats.totalEmailsSent) * 100).toFixed(1)}%` : '0%',
      change: `${stats.totalFailed} failed`,
      trend: stats.totalFailed === 0 ? 'up' : 'down',
      icon: 'i-hugeicons:tick-02',
      color: 'purple'
    },
    {
      label: 'Open Rate',
      value: `${stats.averageOpenRate.toFixed(1)}%`,
      change: `${stats.averageClickRate.toFixed(1)}% CTR`,
      trend: 'up',
      icon: 'i-hugeicons:view',
      color: 'orange'
    }
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time email campaign performance and detailed analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                wsConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {wsConnected ? 'Live' : 'Offline'}
            </div>
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button 
              onClick={loadDashboardData}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="i-hugeicons:loading-03 w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat) => {
            const TrendIcon = stat.trend === 'up' ? 'i-hugeicons:arrow-up-right-01' : 'i-hugeicons:arrow-down-right-01';
            
            return (
              <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                    <div className={`${stat.icon} w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className={`flex items-center text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`${TrendIcon} w-4 h-4 mr-1`} />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Email Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="i-hugeicons:activity-02 w-5 h-5 mr-2" />
                  Real-time Email Activity
                </h2>
                <span className="text-sm text-gray-500">Last 50 emails</span>
              </div>
            </div>
            <div className="p-6">
              <div className="max-h-80 overflow-y-auto">
                {realtimeEmails.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="i-hugeicons:mail-01 w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent email activity</p>
                    <p className="text-sm text-gray-400 mt-1">Email activity will appear here in real-time</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {realtimeEmails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            email.status === 'sent' ? 'bg-green-500' :
                            email.status === 'failed' ? 'bg-red-500' :
                            'bg-blue-500 animate-pulse'
                          }`}></div>
                          <div>
                            <p className="font-mono text-sm text-gray-700">{email.email}</p>
                            <p className="text-xs text-gray-500">{email.campaignName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            email.status === 'sent' ? 'bg-green-100 text-green-800' :
                            email.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {email.status === 'sent' ? 'Sent' : 
                             email.status === 'failed' ? 'Failed' : 'Sending'}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {email.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Performance Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="i-hugeicons:analytics-01 w-5 h-5 mr-2" />
                Performance Overview
              </h2>
            </div>
            <div className="p-6">
              <div className="h-80 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <div className="i-hugeicons:analytics-02 w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Performance Chart</h4>
                  <p className="text-gray-500">Email performance metrics visualization would be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Campaigns from Database */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Email Campaigns</h2>
              <span className="text-sm text-gray-500">From Database</span>
            </div>
          </div>
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
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <div className="i-hugeicons:mail-01 w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No campaigns found</p>
                      <p className="text-sm mt-1">Start sending campaigns to see data here</p>
                    </td>
                  </tr>
                ) : (
                  campaigns.slice(0, 10).map((campaign) => {
                    const successRate = campaign.sentCount > 0 ? (campaign.successCount / campaign.sentCount) * 100 : 0;
                    const openRate = campaign.sentCount > 0 ? (campaign.openedCount / campaign.sentCount) * 100 : 0;
                    
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{campaign.campaignName}</div>
                            <div className="text-sm text-gray-500">{campaign.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(campaign.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 capitalize ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.totalRecipients.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{campaign.sentCount} sent</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(successRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {successRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(openRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {openRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                          {formatDuration(campaign.startTime, campaign.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                          {campaign.startTime.toLocaleDateString()} {campaign.startTime.toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { emailTrackingService, EmailCampaign } from '../services/emailTrackingService';

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignData = await emailTrackingService.getAllCampaigns();
      setCampaigns(campaignData);
    } catch (err) {
      setError('Failed to load campaign data');
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall stats from Firebase data
  const calculateOverallStats = () => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalSuccess = campaigns.reduce((sum, c) => sum + (c.successCount || 0), 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.openedCount || 0), 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + (c.clickedCount || 0), 0);

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    return {
      totalSent,
      totalSuccess,
      openRate,
      clickRate
    };
  };

  const stats = calculateOverallStats();

  const overallStats = [
    {
      label: 'Total Emails Sent',
      value: stats.totalSent.toLocaleString(),
      change: '+12.3%',
      trend: 'up',
      icon: "i-hugeicons:mail-01",
      color: 'blue'
    },
    {
      label: 'Success Rate',
      value: stats.totalSent > 0 ? `${((stats.totalSuccess / stats.totalSent) * 100).toFixed(1)}%` : '0%',
      change: '+2.1%',
      trend: 'up',
      icon: "i-hugeicons:tick-02",
      color: 'green'
    },
    {
      label: 'Open Rate',
      value: `${stats.openRate.toFixed(1)}%`,
      change: '+1.2%',
      trend: 'up',
      icon: "i-hugeicons:view",
      color: 'purple'
    },
    {
      label: 'Click Rate',
      value: `${stats.clickRate.toFixed(1)}%`,
      change: '-0.5%',
      trend: 'down',
      icon: "i-hugeicons:cursor-02",
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="i-hugeicons:loading-03 w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading analytics...</span>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadCampaigns}
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Track your email campaign performance and engagement metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button 
              onClick={loadCampaigns}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="i-hugeicons:loading-03 w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overallStats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? "i-hugeicons:arrow-up-right-01" : 'i-hugeicons:arrow-down-right-01';
            
            return (
              <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                    <div className={`${Icon} w-6 h-6 text-${stat.color}-600`} />
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Email Performance Over Time */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Performance Over Time</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <div className="i-hugeicons:analytics-01 w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chart Placeholder</h4>
                <p className="text-gray-500">Line chart showing email performance metrics over time would be displayed here</p>
              </div>
            </div>
          </div>

          {/* Campaign Performance Comparison */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance Comparison</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <div className="i-hugeicons:analytics-02 w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chart Placeholder</h4>
                <p className="text-gray-500">Bar chart comparing campaign performance metrics would be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance Details</h3>
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
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      <div className="i-hugeicons:mail-01 w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No campaigns found</p>
                      <p className="text-sm mt-1">Start sending campaigns to see analytics data here</p>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign, index) => {
                    const successRate = campaign.sentCount > 0 ? (campaign.successCount / campaign.sentCount) * 100 : 0;
                    const openRate = campaign.sentCount > 0 ? (campaign.openedCount / campaign.sentCount) * 100 : 0;
                    const clickRate = campaign.sentCount > 0 ? (campaign.clickedCount / campaign.sentCount) * 100 : 0;
                    
                    return (
                      <tr key={campaign.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{campaign.campaignName}</div>
                            <div className="text-sm text-gray-500">{campaign.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                            campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {campaign.totalRecipients.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {campaign.sentCount.toLocaleString()}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(clickRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {clickRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                          {campaign.startTime ? new Date(campaign.startTime).toLocaleDateString() : 'N/A'}
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

export default Analytics;

// components/CampaignList.tsx

import React from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { getStatusIcon, getStatusColor, mockCampaigns } from '../utils/campaignHelpers';

export const CampaignList: React.FC = () => {
  const { searchTerm } = useCampaignStore();

  const filteredCampaigns = mockCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
                    <div className={`${getStatusIcon(campaign.status)} w-4 h-4 ${
                      campaign.status === 'sent' ? 'text-green-500' :
                      campaign.status === 'scheduled' ? 'text-blue-500' :
                      campaign.status === 'sending' ? 'text-orange-500' :
                      campaign.status === 'draft' ? 'text-gray-400' :
                      'text-red-500'
                    }`} />
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
                      <div className="i-hugeicons:edit-02 w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                      <div className="i-hugeicons:copy-01 w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <div className="i-hugeicons:delete-02 w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <div className="i-hugeicons:more-horizontal w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  MousePointer
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Total Campaigns',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Mail,
      color: 'blue'
    },
    {
      label: 'Active Subscribers',
      value: '8,549',
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    {
      label: 'Open Rate',
      value: '24.8%',
      change: '-2.4%',
      trend: 'down',
      icon: Eye,
      color: 'purple'
    },
    {
      label: 'Click Rate',
      value: '3.2%',
      change: '+0.8%',
      trend: 'up',
      icon: MousePointer,
      color: 'orange'
    }
  ];

  const recentCampaigns = [
    { id: 1, name: 'Summer Sale Newsletter', sent: '2,345', opened: '1,234', clicked: '89', date: '2024-01-15' },
    { id: 2, name: 'Product Update Announcement', sent: '3,456', opened: '1,987', clicked: '156', date: '2024-01-14' },
    { id: 3, name: 'Welcome Series - Part 1', sent: '567', opened: '345', clicked: '23', date: '2024-01-13' },
    { id: 4, name: 'Monthly Newsletter', sent: '4,567', opened: '2,123', clicked: '234', date: '2024-01-12' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your email marketing performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
            
            return (
              <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className={`flex items-center text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
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

        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Campaigns</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View All
              </button>
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
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opened
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {campaign.sent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{campaign.opened}</div>
                      <div className="text-sm text-gray-500">
                        {((parseInt(campaign.opened) / parseInt(campaign.sent)) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{campaign.clicked}</div>
                      <div className="text-sm text-gray-500">
                        {((parseInt(campaign.clicked) / parseInt(campaign.sent)) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(campaign.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
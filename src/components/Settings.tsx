import React, { useState } from 'react';
import { emailService } from '../services/emailService';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('aws');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testing, setTesting] = useState(false);

  const tabs = [
    { id: 'aws', label: 'AWS SES', icon: 'i-hugeicons:server-01' },
    { id: 'smtp', label: 'SMTP Settings', icon: 'i-hugeicons:mail-01' },
    { id: 'api', label: 'API Keys', icon: 'i-hugeicons:key-01' },
    { id: 'notifications', label: 'Notifications', icon: 'i-hugeicons:notification-01' },
    { id: 'account', label: 'Account', icon: 'i-hugeicons:user' },
    { id: 'appearance', label: 'Appearance', icon: 'i-hugeicons:paint-brush-02' },
  ];

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await emailService.testConnection();
      setTestResult(result.success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'aws':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AWS SES Configuration</h3>
              <p className="text-gray-600 mb-6">Configure your Amazon SES settings for sending emails</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AWS Access Key ID
                </label>
                <input
                  type="text"
                  defaultValue="AKIA3FLD4SRKSIO2IY53"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your AWS Access Key ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AWS Secret Access Key
                </label>
                <input
                  type="password"
                  defaultValue="BPkk/T7c5C3NwlfWXi9lZwZuWOBG5djdY2c+XWhnRrZK"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your AWS Secret Access Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AWS Region
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="us-east-1">US East (N. Virginia) - us-east-1</option>
                  <option value="us-west-2">US West (Oregon) - us-west-2</option>
                  <option value="eu-west-1">Europe (Ireland) - eu-west-1</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address
                </label>
                <input
                  type="email"
                  defaultValue="allmamun@websparks.ai"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your verified sender email"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <div className="i-hugeicons:test-tube w-4 h-4 mr-2" />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResult === 'success' && (
                <div className="flex items-center text-green-600">
                  <div className="i-hugeicons:shield-01 w-4 h-4 mr-2" />
                  Connection successful!
                </div>
              )}
              {testResult === 'error' && (
                <div className="flex items-center text-red-600">
                  <div className="i-hugeicons:cancel-circle w-4 h-4 mr-2" />
                  Connection failed!
                </div>
              )}
            </div>
          </div>
        );

      case 'smtp':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP Configuration</h3>
              <p className="text-gray-600 mb-6">Configure SMTP settings for email delivery</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  defaultValue="email-smtp.us-east-1.amazonaws.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  defaultValue="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter SMTP username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter SMTP password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="tls"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
              <label htmlFor="tls" className="ml-2 text-sm text-gray-700">
                Use TLS encryption
              </label>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>
              <p className="text-gray-600 mb-6">Manage API keys for third-party integrations</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Production API Key</h4>
                  <p className="text-sm text-gray-500">pk_live_••••••••••••••••••••••••••••</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Regenerate
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Test API Key</h4>
                  <p className="text-sm text-gray-500">pk_test_••••••••••••••••••••••••••••</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <p className="text-gray-600 mb-6">Configure how you receive notifications</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Campaign Completed</h4>
                  <p className="text-sm text-gray-500">Get notified when campaigns finish sending</p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">High Bounce Rate</h4>
                  <p className="text-sm text-gray-500">Alert when bounce rate exceeds threshold</p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                  <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                </div>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <p className="text-gray-600 mb-6">Manage your account information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  defaultValue="WebSparks AI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Zone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Eastern Time (EST)</option>
                  <option>Pacific Time (PST)</option>
                  <option>Central Time (CST)</option>
                  <option>Mountain Time (MST)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
              <p className="text-gray-600 mb-6">Customize the look and feel of your dashboard</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      className="text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="ml-2">Light</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Dark</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="auto"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Auto</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sidebar Position
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sidebar"
                      value="left"
                      className="text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="ml-2">Left</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sidebar"
                      value="right"
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Right</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your email marketing platform settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`${tab.icon} w-5 h-5 mr-3 ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {renderTabContent()}
              
              <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <div className="i-hugeicons:save-01 w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

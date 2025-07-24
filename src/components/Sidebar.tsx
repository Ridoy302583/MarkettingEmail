import React, { useState } from 'react';

type ActiveSection = 'dashboard' | 'campaigns' | 'contacts' | 'templates' | 'analytics' | 'settings' | 'monitor';

interface SidebarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  onLogout: () => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'i-hugeicons:analytics-01' },
    { id: 'campaigns', label: 'Campaigns', icon: 'i-hugeicons:mail-01' },
    { id: 'contacts', label: 'Contacts', icon: 'i-hugeicons:user-group' },
    { id: 'templates', label: 'Templates', icon: 'i-hugeicons:file-02' },
    { id: 'analytics', label: 'Analytics', icon: 'i-hugeicons:analytics-02' },
    { id: 'monitor', label: 'Email Monitor', icon: 'i-hugeicons:activity-02' },
    { id: 'settings', label: 'Settings', icon: 'i-hugeicons:settings-02' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-10">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <div className="i-hugeicons:lightning-01 w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EmailSpark</h1>
              <p className="text-sm text-gray-500">Marketing Platform</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-4">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as ActiveSection)}
                  className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`${item.icon} w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Section - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="i-hugeicons:logout-01 w-5 h-5 mr-3 text-gray-400 hover:text-red-600" />
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-3">
                <div className="i-hugeicons:alert-triangle w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              You will be logged out of your account and redirected to the login page.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoggingOut && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

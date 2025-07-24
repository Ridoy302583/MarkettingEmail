// components/ContactsList.tsx

import React, { useEffect } from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { getPlanBadgeStyle } from '../utils/campaignHelpers';
import { useContacts } from '../hooks/useContacts';

export const ContactsList: React.FC = () => {
  const {
    allContacts,
    contactSearchTerm,
    setContactSearchTerm,
    loadingContacts,
    contactsError
  } = useCampaignStore();

  const {
    filteredContacts,
    selectedContacts,
    fetchContacts,
    handleSelectContact,
    handleSelectAllContacts,
    clearContactsCache,
    isCacheValid
  } = useContacts();

  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  // Load contacts on mount if not cached
  useEffect(() => {
    if (allContacts.length === 0 && !loadingContacts) {
      console.log('📋 Loading contacts on ContactsList mount');
      fetchContacts();
    }
  }, []);

  const handleRefreshContacts = () => {
    console.log('📋 Force refreshing contacts');
    clearContactsCache();
    fetchContacts(true);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          <div className="i-hugeicons:user-group w-4 h-4 mr-2" />
          Select Recipients ({allContacts.length} total, {filteredContacts.length} filtered)
          {isCacheValid() && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Cached
            </span>
          )}
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshContacts}
            disabled={loadingContacts}
            className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Force refresh contacts"
          >
            <div className={`i-hugeicons:loading-03 w-4 h-4 mr-1 ${loadingContacts ? 'animate-spin' : ''}`} />
            {loadingContacts ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={clearContactsCache}
            className="flex items-center px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            title="Clear contacts cache"
          >
            <div className="i-hugeicons:delete-02 w-4 h-4 mr-1" />
            Clear Cache
          </button>
        </div>
      </div>

      {loadingContacts && allContacts.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="i-hugeicons:loading-03 w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading contacts for the first time...</span>
        </div>
      )}

      {loadingContacts && allContacts.length > 0 && (
        <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg mb-4">
          <div className="i-hugeicons:loading-03 w-4 h-4 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-700 text-sm">Refreshing contacts...</span>
        </div>
      )}

      {contactsError && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="i-hugeicons:alert-triangle w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{contactsError}</p>
            <button
              onClick={() => {
                console.log('Manual retry - Current token:', getAccessToken()?.substring(0, 20) + '...');
                fetchContacts(true);
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
            <div className="i-hugeicons:search-01 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                <div className="i-hugeicons:user w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No contacts match your filters</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filter criteria in the left sidebar
                </p>
                {allContacts.length === 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Debug Help:</strong> Check the browser console (F12) for detailed error logs.
                      <br />API Token exists: <strong>{getAccessToken() ? 'Yes' : 'No'}</strong>
                      <br />Cache valid: <strong>{isCacheValid() ? 'Yes' : 'No'}</strong>
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
                        <div className="i-hugeicons:tick-02 w-4 h-4 text-green-500" title="Email Verified" />
                      ) : (
                        <div className="i-hugeicons:cancel-circle w-4 h-4 text-red-500" title="Email Not Verified" />
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
  );
};

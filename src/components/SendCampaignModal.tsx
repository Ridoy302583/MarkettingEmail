// components/SendCampaignModal.tsx

import React from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { useCampaignActions } from '../hooks/useCampaignActions';
import { CampaignFilters } from './CampaignFilters';
import { ContactsList } from './ContactsList';
import { EmailProgressDashboard } from './EmailProgressDashboard';
import { TemplateSelector } from './TemplateSelector';
import { useWebSocket } from '../hooks/useWebSocket';

export const SendCampaignModal: React.FC = () => {
  const {
    showSendModal,
    sendingStatus,
    selectedTemplate,
    selectedContacts,
    sendResult,
    emailProgress
  } = useCampaignStore();

  const { isConnected } = useWebSocket(showSendModal);
  const {
    handleSendCampaign,
    handlePauseCampaign,
    handleResumeCampaign,
    handleStopCampaign,
    resetCampaignState
  } = useCampaignActions();

  if (!showSendModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-7xl mx-4 max-h-[95vh] flex relative">
        {/* Left Sidebar - Filters */}
        <div className={`${sendingStatus === 'sending' || sendingStatus === 'paused' ? 'w-64' : 'w-80'} border-r border-gray-200 p-6 overflow-y-auto`}>
          <CampaignFilters isConnected={isConnected} />
        </div>

        {/* Right Content - Contacts and Templates */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center justify-between mb-4">
            <div className='w-full flex items-center justify-between'>
              <h3 className="text-lg font-semibold text-gray-900">Send Email Campaign</h3>
              <button
                onClick={resetCampaignState}
                className=" text-gray-400 hover:text-white transition-colors duration-200 bg-transparent p-1.5 rounded-full hover:bg-white/10"
                style={{
                  animation: 'fadeIn 0.3s ease-out 0.1s forwards',
                  animationFillMode: 'backwards'
                }}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button></div>
            {sendingStatus === 'sending' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePauseCampaign}
                  className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  <div className="i-hugeicons:pause w-4 h-4 mr-1" />
                  Pause
                </button>
                <button
                  onClick={handleStopCampaign}
                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <div className="i-hugeicons:stop w-4 h-4 mr-1" />
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
                  <div className="i-hugeicons:play w-4 h-4 mr-1" />
                  Resume
                </button>
                <button
                  onClick={handleStopCampaign}
                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <div className="i-hugeicons:stop w-4 h-4 mr-1" />
                  Stop
                </button>
              </div>
            )}
          </div>

          {/* Real-time Progress Dashboard */}
          {(sendingStatus === 'sending' || sendingStatus === 'paused') && (
            <EmailProgressDashboard />
          )}

          {sendingStatus === 'idle' && (
            <>
              <ContactsList />
              <TemplateSelector />
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
              <div className="i-hugeicons:tick-02 w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Campaign Completed Successfully!</h4>
              <p className="text-gray-600 mb-4">{sendResult.message}</p>
              {sendResult.stats && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ {sendResult.stats.successCount || sendResult.stats.successful} emails sent successfully<br />
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
              <div className="i-hugeicons:cancel-circle w-16 h-16 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Failed to Send Campaign</h4>
              <p className="text-red-600">{sendResult.message}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={resetCampaignState}
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
  );
};

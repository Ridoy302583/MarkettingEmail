// components/EmailProgressDashboard.tsx

import React from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { getEmailStatusIcon, getEmailStatusColor, calculateProgress, formatDuration } from '../utils/campaignHelpers';

export const EmailProgressDashboard: React.FC = () => {
  const { emailProgress, emailQueue, sendingStatus } = useCampaignStore();

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <div className="i-hugeicons:activity-02 w-5 h-5 mr-2 text-blue-600" />
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
          <span className="text-sm text-gray-500">{calculateProgress(emailProgress.sent, emailProgress.total).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress(emailProgress.sent, emailProgress.total)}%` }}
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
          <div className="i-hugeicons:mail-01 w-4 h-4 mr-2" />
          Email Progress ({emailQueue.allEmails.size} total)
        </h5>
        <div className="bg-white rounded-lg border max-h-64 overflow-y-auto">
          {emailQueue.allEmails.size === 0 ? (
            <p className="text-gray-500 text-center py-8">No emails in queue...</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {Array.from(emailQueue.allEmails.values())
                .sort((a, b) => {
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
                      <div className={`${getEmailStatusIcon(email.status)} w-4 h-4 ${
                        email.status === 'sent' ? 'text-green-500' :
                        email.status === 'failed' ? 'text-red-500' :
                        email.status === 'sending' ? 'text-blue-500 animate-spin' :
                        email.status === 'pending' ? 'text-yellow-500' :
                        'text-gray-400'
                      }`} />
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
          <div className="i-hugeicons:analytics-01 w-4 h-4 mr-2" />
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
  );
};
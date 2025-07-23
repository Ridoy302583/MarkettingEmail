import React, { useState, useEffect, useRef } from 'react';

interface EmailJob {
  id: string;
  name: string;
  totalEmails: number;
  sent: number;
  pending: number;
  success: number;
  failed: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  estimatedCompletion?: Date;
  emailsPerSecond: number;
  errors: EmailError[];
}

interface EmailError {
  id: string;
  email: string;
  error: string;
  timestamp: Date;
}

interface EmailProgress {
  jobId: string;
  email: string;
  status: 'sending' | 'sent' | 'failed';
  timestamp: Date;
  error?: string;
}

const EmailMonitor: React.FC = () => {
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [activeJob, setActiveJob] = useState<EmailJob | null>(null);
  const [realtimeProgress, setRealtimeProgress] = useState<EmailProgress[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [jobName, setJobName] = useState('');
  const [batchSize, setBatchSize] = useState(100);
  const [delayBetweenBatches, setDelayBetweenBatches] = useState(1000);

  const wsRef = useRef<WebSocket | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    // In a real implementation, this would connect to your WebSocket server
    const simulateWebSocket = () => {
      setIsConnected(true);

      // Simulate real-time updates
      const interval = setInterval(() => {
        if (activeJob && activeJob.status === 'running') {
          setActiveJob(prev => {
            if (!prev || prev.status !== 'running') return prev;

            const newSent = Math.min(prev.sent + Math.floor(Math.random() * 10) + 1, prev.totalEmails);
            const newSuccess = Math.min(prev.success + Math.floor(Math.random() * 8) + 1, newSent);
            const newFailed = newSent - newSuccess;
            const newPending = prev.totalEmails - newSent;

            const updatedJob = {
              ...prev,
              sent: newSent,
              success: newSuccess,
              failed: newFailed,
              pending: newPending,
              emailsPerSecond: Math.floor(Math.random() * 5) + 3,
              status: newSent >= prev.totalEmails ? 'completed' as const : 'running' as const,
              endTime: newSent >= prev.totalEmails ? new Date() : undefined
            };

            // Add to progress log
            setRealtimeProgress(prevProgress => {
              const newProgress: EmailProgress[] = [];
              for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
                newProgress.push({
                  jobId: prev.id,
                  email: `user${Math.floor(Math.random() * 10000)}@example.com`,
                  status: Math.random() > 0.1 ? 'sent' : 'failed',
                  timestamp: new Date(),
                  error: Math.random() > 0.9 ? 'SMTP timeout' : undefined
                });
              }
              return [...newProgress, ...prevProgress].slice(0, 100);
            });

            return updatedJob;
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateWebSocket();
    return cleanup;
  }, [activeJob]);

  // Auto-scroll progress log
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.scrollTop = 0;
    }
  }, [realtimeProgress]);

  const createEmailJob = () => {
    if (!jobName || !emailSubject || !emailTemplate || selectedContacts.length === 0) {
      alert('Please fill in all required fields and select contacts');
      return;
    }

    const newJob: EmailJob = {
      id: `job_${Date.now()}`,
      name: jobName,
      totalEmails: selectedContacts.length,
      sent: 0,
      pending: selectedContacts.length,
      success: 0,
      failed: 0,
      status: 'idle',
      emailsPerSecond: 0,
      errors: []
    };

    setJobs(prev => [newJob, ...prev]);
    setShowCreateJob(false);

    // Reset form
    setJobName('');
    setEmailSubject('');
    setEmailTemplate('');
    setSelectedContacts([]);
  };

  const startJob = (job: EmailJob) => {
    const updatedJob = {
      ...job,
      status: 'running' as const,
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + (job.totalEmails / 5) * 1000) // Estimate 5 emails per second
    };

    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
    setActiveJob(updatedJob);
    setRealtimeProgress([]);
  };

  const pauseJob = (job: EmailJob) => {
    const updatedJob = { ...job, status: 'paused' as const };
    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
    if (activeJob?.id === job.id) {
      setActiveJob(updatedJob);
    }
  };

  const stopJob = (job: EmailJob) => {
    const updatedJob = {
      ...job,
      status: 'completed' as const,
      endTime: new Date()
    };
    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
    if (activeJob?.id === job.id) {
      setActiveJob(null);
    }
  };

  const getStatusIcon = (status: EmailJob['status']) => {
    switch (status) {
      case 'running':
        return <div className="i-hugeicons:activity-02 w-4 h-4 text-green-500 animate-pulse" />;
      case 'paused':
        return <div className="i-hugeicons:pause w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <div className="i-hugeicons:tick-02 w-4 h-4 text-green-500" />;
      case 'failed':
        return <div className="i-hugeicons:cancel-circle w-4 h-4 text-red-500" />;
      default:
        return <div className="i-hugeicons:clock-01 w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: EmailJob['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (job: EmailJob) => {
    return job.totalEmails > 0 ? (job.sent / job.totalEmails) * 100 : 0;
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return '-';
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mock contacts for demo
  const mockContacts = Array.from({ length: 25000 }, (_, i) => ({
    id: i + 1,
    email: `user${i + 1}@example.com`,
    firstName: `User${i + 1}`,
    lastName: 'Test'
  }));

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Monitor</h1>
            <p className="text-gray-600 mt-2">Real-time bulk email sending monitoring and analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={() => setShowCreateJob(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="i-hugeicons:mail-01 w-4 h-4 mr-2" />
              New Email Job
            </button>
          </div>
        </div>

        {/* Active Job Dashboard */}
        {activeJob && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {getStatusIcon(activeJob.status)}
                    <span className="ml-2">{activeJob.name}</span>
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeJob.totalEmails.toLocaleString()} total emails •
                    {activeJob.emailsPerSecond} emails/sec •
                    Duration: {formatDuration(activeJob.startTime, activeJob.endTime)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {activeJob.status === 'idle' && (
                    <button
                      onClick={() => startJob(activeJob)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <div className="i-hugeicons:play w-4 h-4 mr-1" />
                      Start
                    </button>
                  )}
                  {activeJob.status === 'running' && (
                    <>
                      <button
                        onClick={() => pauseJob(activeJob)}
                        className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <div className="i-hugeicons:pause w-4 h-4 mr-1" />
                        Pause
                      </button>
                      <button
                        onClick={() => stopJob(activeJob)}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <div className="i-hugeicons:stop w-4 h-4 mr-1" />
                        Stop
                      </button>
                    </>
                  )}
                  {activeJob.status === 'paused' && (
                    <button
                      onClick={() => startJob(activeJob)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <div className="i-hugeicons:play w-4 h-4 mr-1" />
                      Resume
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Sent</p>
                      <p className="text-2xl font-bold text-blue-900">{activeJob.sent.toLocaleString()}</p>
                    </div>
                    <div className="i-hugeicons:mail-01 w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Successful</p>
                      <p className="text-2xl font-bold text-green-900">{activeJob.success.toLocaleString()}</p>
                    </div>
                    <div className="i-hugeicons:tick-02 w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Failed</p>
                      <p className="text-2xl font-bold text-red-900">{activeJob.failed.toLocaleString()}</p>
                    </div>
                    <div className="i-hugeicons:cancel-circle w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">{activeJob.pending.toLocaleString()}</p>
                    </div>
                    <div className="i-hugeicons:clock-01 w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-gray-500">{calculateProgress(activeJob).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${calculateProgress(activeJob)}%` }}
                  ></div>
                </div>
              </div>

              {/* Real-time Progress Log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="i-hugeicons:activity-02 w-5 h-5 mr-2" />
                    Real-time Progress
                  </h3>
                  <div
                    ref={progressRef}
                    className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto border"
                  >
                    {realtimeProgress.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No activity yet...</p>
                    ) : (
                      <div className="space-y-2">
                        {realtimeProgress.map((progress, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              {progress.status === 'sent' ? (
                                <div className="i-hugeicons:tick-02 w-4 h-4 text-green-500 mr-2" />
                              ) : (
                                <div className="i-hugeicons:cancel-circle w-4 h-4 text-red-500 mr-2" />
                              )}
                              <span className="font-mono text-xs">{progress.email}</span>
                            </div>
                            <span className="text-gray-500">
                              {progress.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="i-hugeicons:analytics-01 w-5 h-5 mr-2" />
                    Performance Metrics
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 h-64">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-semibold">
                          {activeJob.sent > 0 ? ((activeJob.success / activeJob.sent) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emails/Second:</span>
                        <span className="font-semibold">{activeJob.emailsPerSecond}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Completion:</span>
                        <span className="font-semibold">
                          {activeJob.estimatedCompletion ?
                            activeJob.estimatedCompletion.toLocaleTimeString() :
                            '-'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Remaining:</span>
                        <span className="font-semibold">
                          {activeJob.pending > 0 && activeJob.emailsPerSecond > 0 ?
                            `${Math.ceil(activeJob.pending / activeJob.emailsPerSecond)}s` :
                            '-'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Email Jobs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Emails
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{job.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(job.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{job.sent}</span>
                          <span>{job.totalEmails}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${calculateProgress(job)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {job.totalEmails.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {job.sent > 0 ? `${((job.success / job.sent) * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDuration(job.startTime, job.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveJob(job)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <div className="i-hugeicons:view w-4 h-4" />
                        </button>
                        {job.status === 'idle' && (
                          <button
                            onClick={() => startJob(job)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Start Job"
                          >
                            <div className="i-hugeicons:play w-4 h-4" />
                          </button>
                        )}
                        {job.status === 'running' && (
                          <button
                            onClick={() => pauseJob(job)}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                            title="Pause Job"
                          >
                            <div className="i-hugeicons:pause w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Email Job</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Name
                </label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Summer Campaign 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email template..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay Between Batches (ms)
                  </label>
                  <input
                    type="number"
                    value={delayBetweenBatches}
                    onChange={(e) => setDelayBetweenBatches(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="100"
                    max="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Recipients
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === mockContacts.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts(mockContacts);
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm font-medium">
                      Select All ({mockContacts.length.toLocaleString()} contacts)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedContacts.length.toLocaleString()} contacts selected
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateJob(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createEmailJob}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default EmailMonitor;

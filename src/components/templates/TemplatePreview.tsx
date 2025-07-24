import React, { useState } from 'react';
import { EmailTemplate } from '../../types/EmailTemplate';

interface TemplatePreviewProps {
  template: EmailTemplate;
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose }) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const getPreviewHtml = () => {
    // Replace template variables with sample data for preview
    return template.html
      .replace(/{{firstName}}/g, 'John')
      .replace(/{{lastName}}/g, 'Doe')
      .replace(/{{email}}/g, 'john.doe@example.com')
      .replace(/{{companyName}}/g, 'WebSparks AI');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-gray-600">{template.subject}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Device Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="i-hugeicons:computer w-4 h-4 mr-2" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="i-hugeicons:mobile-phone w-4 h-4 mr-2" />
                Mobile
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <div className="i-hugeicons:cancel-01 w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="flex justify-center">
            <div 
              className={`bg-white rounded-lg shadow-lg transition-all duration-300 ${
                previewMode === 'desktop' 
                  ? 'w-full max-w-4xl' 
                  : 'w-80 max-w-sm'
              }`}
            >
              {/* Email Client Header Mockup */}
              <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-xs text-gray-600">
                    {previewMode === 'desktop' ? 'Email Client - Desktop View' : 'Email Client - Mobile View'}
                  </div>
                </div>
              </div>

              {/* Email Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="i-hugeicons:mail-01 w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">WebSparks AI</div>
                    <div className="text-xs text-gray-500 truncate">allmamun@websparks.ai</div>
                  </div>
                  <div className="text-xs text-gray-400">2 min ago</div>
                </div>
                <div className="mt-2 text-sm font-medium text-gray-900">
                  {template.subject}
                </div>
              </div>

              {/* Email Content */}
              <div className="overflow-hidden">
                <iframe
                  srcDoc={getPreviewHtml()}
                  className={`w-full border-0 transition-all duration-300 ${
                    previewMode === 'desktop' ? 'h-[600px]' : 'h-[500px]'
                  }`}
                  title="Email Preview"
                />
              </div>
            </div>
          </div>

          {/* Template Details */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <div className="i-hugeicons:information w-5 h-5 mr-2" />
                Template Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      template.category === 'promotional' ? 'bg-green-100 text-green-800' :
                      template.category === 'newsletter' ? 'bg-blue-100 text-blue-800' :
                      template.category === 'transactional' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Usage Count:</span>
                  <div className="mt-1 font-medium text-gray-900">{template.usageCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <div className="mt-1 font-medium text-gray-900">{template.createdDate}</div>
                </div>
                <div>
                  <span className="text-gray-600">Last Modified:</span>
                  <div className="mt-1 font-medium text-gray-900">{template.lastModified}</div>
                </div>
              </div>
            </div>

            {/* Preview Variables Info */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <div className="i-hugeicons:code w-4 h-4 mr-2" />
                Template Variables (Preview Data):
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center">
                  <code className="bg-white px-2 py-1 rounded text-blue-600">{{firstName}}</code>
                  <span className="ml-2 text-blue-700">→ John</span>
                </div>
                <div className="flex items-center">
                  <code className="bg-white px-2 py-1 rounded text-blue-600">{{lastName}}</code>
                  <span className="ml-2 text-blue-700">→ Doe</span>
                </div>
                <div className="flex items-center">
                  <code className="bg-white px-2 py-1 rounded text-blue-600">{{email}}</code>
                  <span className="ml-2 text-blue-700">→ john.doe@example.com</span>
                </div>
                <div className="flex items-center">
                  <code className="bg-white px-2 py-1 rounded text-blue-600">{{companyName}}</code>
                  <span className="ml-2 text-blue-700">→ WebSparks AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;

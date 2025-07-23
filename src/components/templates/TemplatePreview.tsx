import React from 'react';
import { EmailTemplate } from '../../types/EmailTemplate';

interface TemplatePreviewProps {
  template: EmailTemplate;
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-gray-600">{template.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full flex justify-center items-center bg-gray-300 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <div className='i-hugeicons:multiplication-sign' />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              srcDoc={template.html}
              className="w-full h-96 border-0"
              title="Email Preview"
            />
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Template Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{template.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Usage Count:</span>
                <span className="ml-2 font-medium">{template.usageCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">{template.createdDate}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Modified:</span>
                <span className="ml-2 font-medium">{template.lastModified}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;

import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../types/EmailTemplate';

interface TemplateFormProps {
  template?: EmailTemplate | null;
  onSave: (template: Omit<EmailTemplate, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    category: 'promotional',
    thumbnail: '',
    html: '',
    createdDate: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
    usageCount: 0
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    console.log('🔄 TemplateForm useEffect triggered with template:', template);
    
    if (template) {
      console.log('✏️ Editing existing template:', template.name);
      const templateData = {
        name: template.name || '',
        subject: template.subject || '',
        category: template.category || 'promotional',
        thumbnail: template.thumbnail || '',
        html: template.html || '',
        createdDate: template.createdDate || new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: template.usageCount || 0
      };
      
      console.log('📝 Setting form data:', templateData);
      setFormData(templateData);
      setPreviewHtml(template.html || '');
    } else {
      console.log('🆕 Creating new template - resetting form');
      const newTemplateData = {
        name: '',
        subject: '',
        category: 'promotional',
        thumbnail: '',
        html: '',
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0
      };
      
      setFormData(newTemplateData);
      setPreviewHtml('');
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('💾 Submitting form with data:', formData);
    
    if (!formData.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    if (!formData.subject.trim()) {
      alert('Please enter a subject line');
      return;
    }
    
    if (!formData.html.trim()) {
      alert('Please enter HTML content');
      return;
    }
    
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`📝 Form field changed: ${name} = ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update preview in real-time for HTML changes
    if (name === 'html') {
      setPreviewHtml(value);
    }
  };

  const getPreviewHtml = () => {
    if (!previewHtml) {
      return `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif; color: #666;">
          <div style="font-size: 48px; margin-bottom: 20px;">📧</div>
          <h2 style="color: #333; margin-bottom: 10px;">Start Creating Your Template</h2>
          <p>Enter HTML content in the editor to see a live preview here</p>
        </div>
      `;
    }

    // Replace template variables with sample data for preview
    return previewHtml
      .replace(/{{firstName}}/g, 'John')
      .replace(/{{lastName}}/g, 'Doe')
      .replace(/{{email}}/g, 'john.doe@example.com')
      .replace(/{{companyName}}/g, 'WebSparks AI');
  };

  const handleCancel = () => {
    console.log('❌ Form cancelled');
    onCancel();
  };

  console.log('🎨 TemplateForm rendering with:', {
    isEditing: !!template,
    templateName: template?.name,
    formDataName: formData.name,
    showPreview
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex">
        {/* Left Panel - Form */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 flex flex-col`}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {template ? `Edit Template: ${template.name}` : 'Create New Template'}
              </h2>
              <p className="text-gray-600 mt-1">Design your email template with live preview</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showPreview 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="i-hugeicons:view w-4 h-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="i-hugeicons:cancel-01 w-5 h-5" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="promotional">Promotional</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="transactional">Transactional</option>
                  <option value="welcome">Welcome</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content *
              </label>
              <div className="relative">
                <textarea
                  name="html"
                  value={formData.html}
                  onChange={handleChange}
                  required
                  rows={showPreview ? 20 : 16}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                  placeholder="Enter HTML content for the email template..."
                />
                <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                  Use {{firstName}}, {{lastName}}, {{email}} for personalization
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="i-hugeicons:loading-03 w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <div className="i-hugeicons:tick-02 w-4 h-4" />
                    {template ? 'Update Template' : 'Create Template'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Live Preview */}
        {showPreview && (
          <div className="w-1/2 flex flex-col bg-gray-50">
            {/* Preview Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                <div className="flex items-center space-x-2">
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
                </div>
              </div>
              
              {/* Subject Line Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Subject Line:</div>
                <div className="font-medium text-gray-900">
                  {formData.subject || 'Enter subject line...'}
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-center">
                <div 
                  className={`bg-white rounded-lg shadow-lg transition-all duration-300 ${
                    previewMode === 'desktop' 
                      ? 'w-full max-w-2xl' 
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
                        {previewMode === 'desktop' ? 'Email Client - Desktop' : 'Email Client - Mobile'}
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
                        <div className="text-xs text-gray-500 truncate">noreply@websparks.ai</div>
                      </div>
                      <div className="text-xs text-gray-400">now</div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-900">
                      {formData.subject || 'Your Email Subject'}
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="overflow-hidden">
                    <iframe
                      srcDoc={getPreviewHtml()}
                      className={`w-full border-0 transition-all duration-300 ${
                        previewMode === 'desktop' ? 'h-96' : 'h-80'
                      }`}
                      title="Email Preview"
                      style={{
                        transform: previewMode === 'mobile' ? 'scale(0.9)' : 'scale(1)',
                        transformOrigin: 'top left'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Info */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <div className="i-hugeicons:information w-4 h-4 mr-2" />
                  Preview updates automatically as you type
                </div>
              </div>

              {/* Template Variables Info */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{{firstName}}</code>
                    <span className="ml-2 text-gray-600">→ John</span>
                  </div>
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{{lastName}}</code>
                    <span className="ml-2 text-gray-600">→ Doe</span>
                  </div>
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{{email}}</code>
                    <span className="ml-2 text-gray-600">→ john.doe@example.com</span>
                  </div>
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{{companyName}}</code>
                    <span className="ml-2 text-gray-600">→ WebSparks AI</span>
                  </div>
                </div>
              </div>

              {/* Responsive Design Tips */}
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                  <div className="i-hugeicons:bulb w-4 h-4 mr-2" />
                  Responsive Design Tips:
                </h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Use max-width: 600px for email containers</li>
                  <li>• Use table-based layouts for better email client support</li>
                  <li>• Test font sizes: 14px+ for body, 20px+ for headings</li>
                  <li>• Ensure buttons are at least 44px tall for mobile</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateForm;

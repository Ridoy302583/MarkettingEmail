import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../types/EmailTemplate';

interface TemplateFormProps {
  template?: EmailTemplate;
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
    createdDate: '',
    lastModified: '',
    usageCount: 0
  });

  useEffect(() => {
    if (template) {
      setFormData(template);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
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
              Subject Line
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML Content
            </label>
            <textarea
              name="html"
              value={formData.html}
              onChange={handleChange}
              required
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter HTML content for the email template"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  {template ? 'Update Template' : 'Create Template'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateForm;

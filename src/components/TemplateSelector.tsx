// components/TemplateSelector.tsx

import React, { useEffect, useState } from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { emailTemplates } from '../data/emailTemplates';
import { emailTemplateService } from '../services/emailTemplateService';
import { EmailTemplate } from '../types/EmailTemplate';

export const TemplateSelector: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedTemplate, setSelectedTemplate } = useCampaignStore();
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const fetchedTemplates = await emailTemplateService.getTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
        <div className="i-hugeicons:file-02 w-4 h-4 mr-2" />
        Select Template
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTemplate?.id === template.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <h5 className="font-medium text-gray-900">{template.name}</h5>
            <p className="text-sm text-gray-500">{template.subject}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${template.category === 'promotional' ? 'bg-green-100 text-green-800' :
              template.category === 'newsletter' ? 'bg-blue-100 text-blue-800' :
                template.category === 'welcome' ? 'bg-orange-100 text-orange-800' :
                  'bg-purple-100 text-purple-800'
              }`}>
              {template.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
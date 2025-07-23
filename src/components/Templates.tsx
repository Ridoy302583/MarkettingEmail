import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../types/EmailTemplate';
import { emailTemplateService } from '../services/emailTemplateService';
import CategoryTabs from './templates/CategoryTabs';
import TemplateCard from './templates/TemplateCard';
import TemplateForm from './templates/TemplateForm';
import TemplatePreview from './templates/TemplatePreview';
import ConfirmDialog from './templates/ConfirmDialog';

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; templateId: string; templateName: string }>({
    isOpen: false,
    templateId: '',
    templateName: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setShowForm(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        usageCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      delete duplicatedTemplate.id;
      
      await emailTemplateService.createTemplate(duplicatedTemplate);
      await loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleShareTemplate = (template: EmailTemplate) => {
    const shareData = {
      title: template.name,
      text: template.subject,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSaveTemplate = async (templateData: Omit<EmailTemplate, 'id'>) => {
    try {
      setFormLoading(true);
      
      if (editingTemplate) {
        await emailTemplateService.updateTemplate(editingTemplate.id!, templateData);
      } else {
        await emailTemplateService.createTemplate(templateData);
      }
      
      setShowForm(false);
      setEditingTemplate(undefined);
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      templateId: id,
      templateName: name
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await emailTemplateService.deleteTemplate(deleteConfirm.templateId);
      setDeleteConfirm({ isOpen: false, templateId: '', templateName: '' });
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCounts = () => {
    const counts = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'All Templates', count: templates.length, key: 'all' },
      { name: 'Newsletter', count: counts.newsletter || 0, key: 'newsletter' },
      { name: 'Promotional', count: counts.promotional || 0, key: 'promotional' },
      { name: 'Transactional', count: counts.transactional || 0, key: 'transactional' },
      { name: 'Welcome', count: counts.welcome || 0, key: 'welcome' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="bi bi-arrow-clockwise animate-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="">
        <div className="mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
              <p className="text-gray-600">Design and manage your email templates</p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <div className='i-hugeicons:plus-sign' />
              Create Template
            </button>
          </div>

          <div className="flex items-center justify-between gap-6 ">
            <CategoryTabs
              categories={getCategoryCounts()}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            
            <div className="relative">
              <div className="i-hugeicons:search-01 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></div>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="mx-auto px-6 pb-12">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <i className="bi bi-envelope text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {templates.length === 0 
                ? "Get started by creating your first email template"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {templates.length === 0 && (
              <button
                onClick={handleCreateTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Create Your First Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                onPreview={handlePreviewTemplate}
                onDuplicate={handleDuplicateTemplate}
                onShare={handleShareTemplate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowForm(false);
            setEditingTemplate(undefined);
          }}
          isLoading={formLoading}
        />
      )}

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(undefined)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteConfirm.templateName}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, templateId: '', templateName: '' })}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default Templates;

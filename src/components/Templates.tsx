import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../types/EmailTemplate';
import { emailTemplateService } from '../services/emailTemplateService';
import CategoryTabs from './templates/CategoryTabs';
import TemplateCard from './templates/TemplateCard';
import TemplateForm from './templates/TemplateForm';
import TemplatePreview from './templates/TemplatePreview';
import ConfirmDialog from './templates/ConfirmDialog';

interface TemplatesProps {
  onUseTemplate?: (template: EmailTemplate) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
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
      console.log('📧 Loaded templates:', fetchedTemplates);
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    console.log('🆕 Creating new template');
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    console.log('✏️ Editing template:', template);
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      console.log('📋 Duplicating template:', template.name);
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
      console.log('✅ Template duplicated successfully');
    } catch (error) {
      console.error('❌ Error duplicating template:', error);
    }
  };

  const handleShareTemplate = (template: EmailTemplate) => {
    console.log('🔗 Sharing template:', template.name);
    const shareData = {
      title: template.name,
      text: template.subject,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Template link copied to clipboard!');
    }
  };

  const handleSaveTemplate = async (templateData: Omit<EmailTemplate, 'id'>) => {
    try {
      setFormLoading(true);
      
      if (editingTemplate && editingTemplate.id) {
        console.log('💾 Updating template:', editingTemplate.id, templateData);
        await emailTemplateService.updateTemplate(editingTemplate.id, templateData);
        console.log('✅ Template updated successfully');
      } else {
        console.log('💾 Creating new template:', templateData);
        await emailTemplateService.createTemplate(templateData);
        console.log('✅ Template created successfully');
      }
      
      setShowForm(false);
      setEditingTemplate(null);
      await loadTemplates();
    } catch (error) {
      console.error('❌ Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    console.log('🗑️ Preparing to delete template:', id, name);
    setDeleteConfirm({
      isOpen: true,
      templateId: id,
      templateName: name
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      console.log('🗑️ Deleting template:', deleteConfirm.templateId);
      await emailTemplateService.deleteTemplate(deleteConfirm.templateId);
      setDeleteConfirm({ isOpen: false, templateId: '', templateName: '' });
      await loadTemplates();
      console.log('✅ Template deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    console.log('👁️ Previewing template:', template.name);
    setPreviewTemplate(template);
  };

  const handleCloseForm = () => {
    console.log('❌ Closing form');
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleClosePreview = () => {
    console.log('❌ Closing preview');
    setPreviewTemplate(null);
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
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="i-hugeicons:loading-03 w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading templates...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
            <p className="text-gray-600">Design and manage your email templates</p>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <div className="i-hugeicons:add-01 w-4 h-4" />
            Create Template
          </button>
        </div>

        <div className="flex items-center justify-between gap-6 mb-8">
          <CategoryTabs
            categories={getCategoryCounts()}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          
          <div className="relative">
            <div className="i-hugeicons:search-01 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"></div>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="i-hugeicons:mail-01 w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                onDelete={(id) => handleDeleteTemplate(id, template.name)}
                onPreview={handlePreviewTemplate}
                onDuplicate={handleDuplicateTemplate}
                onShare={handleShareTemplate}
                onUse={onUseTemplate}
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
          onCancel={handleCloseForm}
          isLoading={formLoading}
        />
      )}

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={handleClosePreview}
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

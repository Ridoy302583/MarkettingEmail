import React from 'react';
import { EmailTemplate } from '../../types/EmailTemplate';

interface TemplateCardProps {
    template: EmailTemplate;
    onEdit: (template: EmailTemplate) => void;
    onDelete: (id: string) => void;
    onPreview: (template: EmailTemplate) => void;
    onDuplicate: (template: EmailTemplate) => void;
    onShare: (template: EmailTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onEdit,
    onDelete,
    onPreview,
    onDuplicate,
    onShare
}) => {
    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'promotional':
                return 'bg-green-100 text-green-700';
            case 'newsletter':
                return 'bg-blue-100 text-blue-700';
            case 'transactional':
                return 'bg-purple-100 text-purple-700';
            case 'welcome':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getCategoryEmoji = (category: string) => {
        switch (category.toLowerCase()) {
            case 'promotional':
                return '🏖️';
            case 'newsletter':
                return '📰';
            case 'transactional':
                return '📋';
            case 'welcome':
                return '👋';
            default:
                return '📧';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
            <div className="relative">
                <img
                    src={template.thumbnail || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&h=240'}
                    alt={template.name}
                    className="w-full h-48 object-cover"
                    crossOrigin="anonymous"
                />
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(template.category)}`}>
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {getCategoryEmoji(template.category)} {template.subject}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Used {template.usageCount} times</span>
                    <span>{template.lastModified}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onPreview(template)}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                        <div className='i-hugeicons:view' />
                        <span className="text-sm font-medium">Preview</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onDuplicate(template)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Duplicate"
                        >
                            <div className='i-hugeicons:copy-01' />
                        </button>
                        <button
                            onClick={() => onEdit(template)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Edit"
                        >
                            <div className='i-hugeicons:pencil-edit-02' />
                        </button>
                        <button
                            onClick={() => onDelete(template.id!)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete"
                        >
                            <div className='i-hugeicons:delete-02' />
                        </button>
                        <button
                            onClick={() => onShare(template)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Share"
                        >
                            <div className='i-hugeicons:share-08' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;

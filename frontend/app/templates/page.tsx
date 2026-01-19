'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';

interface Template {
  id: number;
  name: string;
  configJson: string;
  isDefault: boolean;
  createdAt: string;
}

interface TemplateConfig {
  showCustomerEmail: boolean;
  showCustomerPhone: boolean;
  showCustomerLocation: boolean;
  showDiscount: boolean;
  showPaymentInfo: boolean;
  showLogo: boolean;
  showSignature: boolean;
  showQrCode: boolean;
  showNotes: boolean;
  showDueDate: boolean;
  showItemDescription: boolean;
}

const defaultConfig: TemplateConfig = {
  showCustomerEmail: true,
  showCustomerPhone: true,
  showCustomerLocation: true,
  showDiscount: true,
  showPaymentInfo: true,
  showLogo: true,
  showSignature: false,
  showQrCode: false,
  showNotes: true,
  showDueDate: true,
  showItemDescription: true,
};

export default function TemplatesPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [config, setConfig] = useState<TemplateConfig>(defaultConfig);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const businessData = await apiClient.getBusiness();
      if (!businessData) {
        router.push('/profile');
        return;
      }
      setBusiness(businessData);
      const templatesData = await apiClient.getTemplatesByBusiness(businessData.id);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      await apiClient.createTemplate({
        businessId: business.id,
        name: templateName,
        configJson: JSON.stringify(config),
        isDefault: templates.length === 0, // First template is default
      });
      setShowCreateModal(false);
      setTemplateName('');
      setConfig(defaultConfig);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await apiClient.updateTemplate(editingTemplate.id, {
        businessId: business.id,
        name: templateName,
        configJson: JSON.stringify(config),
        isDefault: editingTemplate.isDefault,
      });
      setEditingTemplate(null);
      setTemplateName('');
      setConfig(defaultConfig);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetDefault = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      await apiClient.updateTemplate(templateId, {
        businessId: business.id,
        name: template.name,
        configJson: template.configJson,
        isDefault: true,
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    try {
      setConfig(JSON.parse(template.configJson));
    } catch {
      setConfig(defaultConfig);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await apiClient.deleteTemplate(templateId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-lavender to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-lavender to-pastel-pink">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Invoice Templates</h1>
            <p className="text-lg text-gray-700 mt-2">Customize your invoice appearance</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            + Create Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600 mb-6">No templates yet. Create your first template!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                    {template.isDefault && (
                      <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {Object.entries(JSON.parse(template.configJson) as TemplateConfig).map(([key, value]) => (
                    value && (
                      <div key={key} className="text-sm text-gray-600 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {key.replace(/([A-Z])/g, ' $1').replace('show', '')}
                      </div>
                    )
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium"
                  >
                    Edit
                  </button>
                  {!template.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(template.id)}
                        className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                      >
                        Set Default
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Template Modal */}
        {(showCreateModal || editingTemplate) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Standard Invoice"
                />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Configuration</h3>
                <div className="space-y-3">
                  {Object.entries(config).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700 font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace('show', 'Show')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                    setTemplateName('');
                    setConfig(defaultConfig);
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

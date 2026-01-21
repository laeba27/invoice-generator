'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import StandardTemplate from '@/components/templates/StandardTemplate';
import ClassyTemplate from '@/components/templates/ClassyTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';

// --- Dummy Data for Preview ---
const dummyBusiness = {
  businessName: "Your Business Name",
  address: "123 Business St, Tech City",
  phone: "+91 98765 43210",
  email: "contact@business.com",
  gstNumber: "22AAAAA0000A1Z5",
  stateCode: "22"
};

const dummyCustomer = {
  name: "Sample Client",
  address: "456 Client Ave, Market Town",
  phone: "+91 99887 76655",
  email: "client@example.com",
  gstin: null
};

const dummyInvoiceInvoiceDate = new Date();
const dummyInvoiceDueDate = new Date();
dummyInvoiceDueDate.setDate(dummyInvoiceDueDate.getDate() + 7);

const dummyInvoice = {
  invoiceNumber: "INV-001",
  invoiceDate: dummyInvoiceInvoiceDate.toISOString(),
  dueDate: dummyInvoiceDueDate.toISOString(),
  items: [
    { 
      itemName: "Professional Services", 
      itemDescription: "Consulting and development hours",
      quantity: 10, 
      price: 1500, 
      discount: 0, 
      gstRate: 18, 
      lineTotal: 17700 
    },
    { 
      itemName: "Software License", 
      itemDescription: "Annual subscription",
      quantity: 1, 
      price: 5000, 
      discount: 500, 
      gstRate: 18, 
      lineTotal: 5310 
    }
  ],
  subtotal: 20000,
  totalDiscount: 500,
  taxTotal: 3510,
  total: 23010,
  notes: "This is a sample invoice to demonstrate the template layout. The colors and structure will adapt to your choices.",
  status: "DUE"
};

// --- Interfaces ---

interface Template {
  id: number;
  name: string;
  configJson: string;
  isDefault: boolean;
  createdAt: string;
}

interface PredefinedTemplate {
  id: number;
  name: string;
  usageCount: number;
  previewImageUrl: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  
  // System Template State
  const [systemTemplates, setSystemTemplates] = useState<PredefinedTemplate[]>([]);
  const [selectedSystemTemplateId, setSelectedSystemTemplateId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);

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

      // Load System Templates and Settings
      const sysTemplates = await apiClient.getSystemTemplates();
      setSystemTemplates(sysTemplates);
      
      const settings = await apiClient.getSystemTemplateSettings(businessData.id);
      if (settings && settings.template) {
        setSelectedSystemTemplateId(settings.template.id);
        setSelectedColor(settings.colorHex);
      } else if (sysTemplates.length > 0) {
        // Default to first if none selected
        setSelectedSystemTemplateId(sysTemplates[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    if (!selectedSystemTemplateId) return;
    setSavingSettings(true);
    try {
      await apiClient.assignSystemTemplate({
        businessId: business.id,
        templateId: selectedSystemTemplateId,
        colorHex: selectedColor
      });
      alert('Template style saved successfully!');
      loadData(); 
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Render Preview ---
  const renderPreview = () => {
    const selectedTemplate = systemTemplates.find(t => t.id === selectedSystemTemplateId);
    if (!selectedTemplate) return <div className="p-8 text-center text-gray-500">Select a template to preview</div>;

    const props = {
      invoice: dummyInvoice,
      business: { ...dummyBusiness, businessName: business?.businessName || "Your Business" }, 
      customer: dummyCustomer,
      payments: [],
      colorHex: selectedColor
    };

    switch (selectedTemplate.name) {
      case 'Classy': return <ClassyTemplate {...props} />;
      case 'Modern': return <ModernTemplate {...props} />;
      case 'Standard':
      default: return <StandardTemplate {...props} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-100px)]">
            
            {/* Left Panel: Controls */}
            <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Studio</h1>
                    <p className="text-gray-600">Customize your invoice appearance.</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>1. Select Layout</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {systemTemplates.map((tpl) => (
                            <button 
                                key={tpl.id}
                                onClick={() => setSelectedSystemTemplateId(tpl.id)}
                                className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                    selectedSystemTemplateId === tpl.id 
                                    ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600 shadow-md' 
                                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-white shadow-sm ${selectedSystemTemplateId === tpl.id ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`}>
                                    {tpl.name === "Standard" ? "📄" : tpl.name === "Classy" ? "🎩" : "🚀"}
                                </div>
                                <div>
                                    <span className={`block font-bold ${selectedSystemTemplateId === tpl.id ? 'text-primary-900' : 'text-gray-700'}`}>{tpl.name}</span>
                                    <span className="text-xs text-gray-500">{tpl.usageCount} businesses use this</span>
                                </div>
                                {selectedSystemTemplateId === tpl.id && (
                                    <div className="absolute top-4 right-4 text-primary-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>2. Brand Color</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input 
                                type="color" 
                                value={selectedColor} 
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="h-14 w-24 rounded-lg cursor-pointer border-0 p-1 bg-gray-100 shadow-inner"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Primary Theme</p>
                            <p className="text-xs text-gray-500 font-mono">{selectedColor.toUpperCase()}</p>
                        </div>
                    </div>
                    
                    {/* Preset Colors */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                        {['#000000', '#2563EB', '#DC2626', '#16A34A', '#D97706', '#9333EA'].map(c => (
                            <button 
                                key={c}
                                onClick={() => setSelectedColor(c)}
                                className="w-8 h-8 rounded-full border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                style={{ backgroundColor: c }}
                                aria-label={`Select color ${c}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
                     <h2 className="font-semibold text-gray-800 mb-4">Actions</h2>
                     <button
                        onClick={handleSaveSystemSettings}
                        disabled={savingSettings}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-black transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {savingSettings ? (
                            <>
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span>Save & Apply Style</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Default</span>
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                        This will update the default look for all your future invoices.
                    </p>
                </div>
            </div>

            {/* Right Panel: Live Preview */}
            <div className="lg:w-2/3 bg-gray-200/50 rounded-3xl overflow-hidden border border-gray-200 flex flex-col shadow-inner">
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-500 uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Live Preview
                    </span>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                        <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                        <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center">
                    <div className="w-full max-w-[210mm] bg-white shadow-2xl transition-all duration-300 origin-top transform scale-95 lg:scale-100">
                        {renderPreview()}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

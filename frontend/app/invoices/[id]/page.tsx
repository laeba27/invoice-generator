'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import dynamic from 'next/dynamic';

// Dynamically import templates to avoid SSR issues
const StandardTemplate = dynamic(() => import('@/components/templates/StandardTemplate'), { ssr: false });
const ClassyTemplate = dynamic(() => import('@/components/templates/ClassyTemplate'), { ssr: false });
const ModernTemplate = dynamic(() => import('@/components/templates/ModernTemplate'), { ssr: false });

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [templateSettings, setTemplateSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceId: '',
    bankName: '',
    accountDetails: '',
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (invoiceId) {
      loadInvoiceData();
    }
  }, [router, invoiceId]);

  const loadInvoiceData = async () => {
    try {
      // Load invoice
      const invoiceData = await apiClient.getInvoiceById(parseInt(invoiceId));
      setInvoice(invoiceData);
      
      // Load business
      const businessData = await apiClient.getBusiness();
      setBusiness(businessData);

      // Load template settings
      try {
        const settings = await apiClient.getSystemTemplateSettings(businessData.id);
        setTemplateSettings(settings);
      } catch (err) {
        console.log('No template settings, using default');
        setTemplateSettings({ template: { id: 1, name: 'Standard' }, colorHex: '#3B82F6' });
      }
      
      // Load customer if exists
      if (invoiceData.customerId) {
        try {
          const customerData = await apiClient.getCustomerById(invoiceData.customerId);
          setCustomer(customerData);
        } catch (err) {
          console.error('Error loading customer:', err);
        }
      }
      
      // Load payments
      try {
        const paymentData = await apiClient.getPaymentsByInvoice(parseInt(invoiceId));
        setPayments(paymentData);
      } catch (err) {
        console.error('Error loading payments:', err);
        setPayments([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueAmount = invoice.dueAmount || invoice.totalAmount || invoice.total;
    
    if (paymentForm.amount > dueAmount) {
      alert(`Payment amount cannot exceed due amount of ₹${dueAmount.toFixed(2)}`);
      return;
    }
    
    if (paymentForm.amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    
    try {
      await apiClient.addPayment({
        invoiceId: parseInt(invoiceId),
        ...paymentForm,
      });
      
      setShowPaymentModal(false);
      setPaymentForm({
        amount: 0,
        paymentMethod: 'CASH',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceId: '',
        bankName: '',
        accountDetails: '',
      });
      
      await loadInvoiceData();
    } catch (err: any) {
      alert(err.message || 'Failed to add payment');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await apiClient.deletePayment(paymentId);
      await loadInvoiceData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete payment');
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderInvoiceTemplate = () => {
    if (!invoice || !business) {
      return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
    }

    const templateId = templateSettings?.template?.id || 1;
    const colorHex = templateSettings?.colorHex || '#3B82F6';
    
    const templateProps = {
      invoice,
      business,
      customer,
      payments: payments || [],
      colorHex,
    };

    // Render template based on ID: 1=Standard, 2=Classy, 3=Modern
    switch (templateId) {
      case 2:
        return <ClassyTemplate {...templateProps} />;
      case 3:
        return <ModernTemplate {...templateProps} />;
      case 1:
      default:
        return <StandardTemplate {...templateProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Invoice not found'}</p>
          <Link href="/invoices" className="text-blue-600 hover:text-blue-700 underline">
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Invoice Generator
            </Link>
            <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-700">
              Back to Invoices
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice #{invoice.invoiceNumber}
          </h2>
          <div className="flex gap-3">
            <Link
              href={`/invoices/${invoiceId}/edit`}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Invoice
            </Link>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Invoice
            </button>
          </div>
        </div>

        {/* Invoice Template Display */}
        <div ref={printRef} className="print:shadow-none">
          {renderInvoiceTemplate()}
        </div>

        {/* Payment History Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 print:hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
            {invoice.status !== 'PAID' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                + Add Payment
              </button>
            )}
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.paymentDate)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.referenceId || '-'}
                        {payment.bankName && <div className="text-xs text-gray-500">{payment.bankName}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No payments recorded yet</p>
              <p className="text-sm mt-2">Click "Add Payment" to record a payment</p>
            </div>
          )}
        </div>

        {/* Add Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Payment</h3>
              
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={paymentForm.amount || ''}
                    onChange={(e) => {
                      const inputValue = parseFloat(e.target.value);
                      const maxAmount = invoice.dueAmount || invoice.totalAmount || invoice.total;
                      
                      if (inputValue > maxAmount) {
                        alert(`Amount cannot exceed due amount of ${formatCurrency(maxAmount)}`);
                        return;
                      }
                      
                      setPaymentForm({ ...paymentForm, amount: inputValue });
                    }}
                    required
                    min="0.01"
                    max={invoice.dueAmount || invoice.totalAmount || invoice.total}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Due Amount: {formatCurrency(invoice.dueAmount || invoice.totalAmount || invoice.total)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference ID</label>
                  <input
                    type="text"
                    value={paymentForm.referenceId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceId: e.target.value })}
                    placeholder="Transaction/Reference ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {(paymentForm.paymentMethod === 'BANK' || paymentForm.paymentMethod === 'CHEQUE') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={paymentForm.bankName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                        placeholder="Bank name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Details</label>
                      <input
                        type="text"
                        value={paymentForm.accountDetails}
                        onChange={(e) => setPaymentForm({ ...paymentForm, accountDetails: e.target.value })}
                        placeholder="Account number or details"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    Add Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

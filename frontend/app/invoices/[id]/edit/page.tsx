'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface InvoiceItem {
  id?: number;
  itemName: string;
  itemDescription: string;
  quantity: number;
  price: number;
  discount: number;
  gstRate: number;
  lineTotal: number;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    customerId: '',
    invoiceDate: '',
    dueDate: '',
    notes: '',
    invoiceType: 'INTRA',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      itemName: '',
      itemDescription: '',
      quantity: 1,
      price: 0,
      discount: 0,
      gstRate: 18,
      lineTotal: 0,
    },
  ]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router, invoiceId]);

  const loadData = async () => {
    try {
      // Load invoice
      const invoice = await apiClient.getInvoiceById(parseInt(invoiceId));
      
      // Load customers
      const customerList = await apiClient.getCustomers();
      setCustomers(customerList);

      // Load business
      const businessData = await apiClient.getBusiness();
      setBusiness(businessData);

      // Populate form
      setFormData({
        customerId: invoice.customerId?.toString() || '',
        invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        notes: invoice.notes || '',
        invoiceType: invoice.invoiceType || 'INTRA',
      });

      // Populate items
      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map((item: any) => ({
          id: item.id,
          itemName: item.itemName || '',
          itemDescription: item.itemDescription || '',
          quantity: item.quantity || 1,
          price: item.price || 0,
          discount: item.discount || 0,
          gstRate: item.gstRate || 18,
          lineTotal: item.lineTotal || 0,
        })));
      }

    } catch (err: any) {
      alert(err.message || 'Failed to load invoice');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const calculateLineTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.price;
    const discountAmount = (subtotal * item.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * item.gstRate) / 100;
    return afterDiscount + gstAmount;
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updatedItems[index].lineTotal = calculateLineTotal(updatedItems[index]);
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        itemDescription: '',
        quantity: 1,
        price: 0,
        discount: 0,
        gstRate: 18,
        lineTotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = (itemSubtotal * item.discount) / 100;
      return sum + (itemSubtotal - discountAmount);
    }, 0);

    const totalDiscount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + (itemSubtotal * item.discount) / 100;
    }, 0);

    let cgst = 0, sgst = 0, igst = 0;

    if (formData.invoiceType === 'INTRA') {
      const totalGst = items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.price;
        const discountAmount = (itemSubtotal * item.discount) / 100;
        const afterDiscount = itemSubtotal - discountAmount;
        return sum + (afterDiscount * item.gstRate) / 100;
      }, 0);
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.price;
        const discountAmount = (itemSubtotal * item.discount) / 100;
        const afterDiscount = itemSubtotal - discountAmount;
        return sum + (afterDiscount * item.gstRate) / 100;
      }, 0);
    }

    const totalAmount = subtotal + cgst + sgst + igst;

    return { subtotal, totalDiscount, cgst, sgst, igst, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (items.length === 0 || !items[0].itemName) {
      alert('Please add at least one item');
      return;
    }

    setSaving(true);

    try {
      const totals = calculateTotals();
      
      const invoiceData = {
        customerId: parseInt(formData.customerId),
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        notes: formData.notes,
        invoiceType: formData.invoiceType,
        items: items.map(item => ({
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          gstRate: item.gstRate,
          lineTotal: item.lineTotal,
        })),
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        totalAmount: totals.totalAmount,
      };

      await apiClient.updateInvoice(parseInt(invoiceId), invoiceData);
      alert('Invoice updated successfully!');
      router.push(`/invoices/${invoiceId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Invoice Generator
            </Link>
            <Link href={`/invoices/${invoiceId}`} className="text-sm text-blue-600 hover:text-blue-700">
              Back to Invoice
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Edit Invoice</h2>
          <p className="text-gray-600 mt-2">Update invoice details and items</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Type *
                </label>
                <select
                  value={formData.invoiceType}
                  onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INTRA">Intra-State (CGST + SGST)</option>
                  <option value="INTER">Inter-State (IGST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Add any notes or terms..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        required
                        placeholder="Product/Service name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.itemDescription}
                        onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                        placeholder="Item description (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Rate (%)
                      </label>
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(index, 'gstRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Line Total:</span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span className="font-medium">Total Discount:</span>
                  <span className="font-medium">- {formatCurrency(totals.totalDiscount)}</span>
                </div>
              )}

              {formData.invoiceType === 'INTRA' ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST:</span>
                    <span className="font-medium">{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST:</span>
                    <span className="font-medium">{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IGST:</span>
                  <span className="font-medium">{formatCurrency(totals.igst)}</span>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totals.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating Invoice...' : 'Update Invoice'}
            </button>
            <Link
              href={`/invoices/${invoiceId}`}
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

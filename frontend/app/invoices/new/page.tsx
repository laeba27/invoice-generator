'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

type InvoiceItem = {
  itemName: string;
  itemDescription: string;
  quantity: number;
  price: number;
  discount: number;
  gstRate: number;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([
    { itemName: '', itemDescription: '', quantity: 1, price: 0, discount: 0, gstRate: 18 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Customer creation mode
  const [createNewCustomer, setCreateNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    stateCode: '',
    gstin: '',
  });
  
  // Phase 2 fields
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadCustomers();
  }, [router]);

  const loadCustomers = async () => {
    try {
      const data = await apiClient.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const addItem = () => {
    setItems([...items, { itemName: '', itemDescription: '', quantity: 1, price: 0, discount: 0, gstRate: 18 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const baseTotal = item.quantity * item.price;
    return baseTotal - item.discount;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotalGST = () => {
    return items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item);
      return sum + (itemTotal * item.gstRate) / 100;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalGST() - totalDiscount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let customerId = selectedCustomerId;
      
      // Create new customer if in create mode and name is provided
      if (createNewCustomer && newCustomer.name.trim()) {
        const createdCustomer = await apiClient.createCustomer({
          name: newCustomer.name,
          phone: newCustomer.phone || undefined,
          email: newCustomer.email || undefined,
          address: newCustomer.address || undefined,
          city: newCustomer.city || undefined,
          stateCode: newCustomer.stateCode || undefined,
          gstin: newCustomer.gstin || undefined,
        });
        customerId = createdCustomer.id;
      }
      
      const invoiceData = {
        invoiceTitle: invoiceTitle || undefined,
        invoiceDate: invoiceDate || undefined,
        dueDate: dueDate || undefined,
        totalDiscount: totalDiscount || 0,
        notes: notes || undefined,
        customerId: customerId,
        items: items.map((item) => ({
          itemName: item.itemName,
          itemDescription: item.itemDescription || undefined,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          gstRate: item.gstRate,
        })),
      };

      const response = await apiClient.createInvoice(invoiceData);
      router.push(`/invoices/${response.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Invoice Generator
            </Link>
            <Link
              href="/invoices"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All Invoices
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create New Invoice</h2>
          <p className="mt-2 text-gray-600">
            Fill in the details to generate a GST-compliant invoice
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invoice Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Title
                </label>
                <input
                  type="text"
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  placeholder="e.g., Monthly Service Invoice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={invoiceDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Discount (₹)
                </label>
                <input
                  type="number"
                  value={totalDiscount}
                  onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes or terms & conditions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Information
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCreateNewCustomer(!createNewCustomer);
                  setSelectedCustomerId(null);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {createNewCustomer ? 'Select Existing' : 'Create New Customer'}
              </button>
            </div>

            {createNewCustomer ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      required
                      placeholder="Enter customer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State Code
                    </label>
                    <input
                      type="text"
                      value={newCustomer.stateCode}
                      onChange={(e) => setNewCustomer({ ...newCustomer, stateCode: e.target.value })}
                      placeholder="e.g., 07 for Delhi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTIN
                    </label>
                    <input
                      type="text"
                      value={newCustomer.gstin}
                      onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="customer"
                      checked={selectedCustomerId === null}
                      onChange={() => setSelectedCustomerId(null)}
                      className="mr-3"
                    />
                    <span className="text-sm">Anonymous Customer</span>
                  </label>

                  {filteredCustomers.map((customer) => (
                    <label
                      key={customer.id}
                      className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="customer"
                        checked={selectedCustomerId === customer.id}
                        onChange={() => setSelectedCustomerId(customer.id)}
                        className="mr-3"
                      />
                      <div className="text-sm">
                        <div className="font-medium">{customer.name || 'Unknown'}</div>
                        <div className="text-gray-500">
                          {customer.phone} | State: {customer.stateCode || 'N/A'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) =>
                          updateItem(index, 'itemName', e.target.value)
                        }
                        required
                        placeholder="Product/Service name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Description
                      </label>
                      <textarea
                        value={item.itemDescription}
                        onChange={(e) =>
                          updateItem(index, 'itemDescription', e.target.value)
                        }
                        rows={2}
                        placeholder="Additional details about this item..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, 'quantity', parseInt(e.target.value))
                        }
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, 'price', parseFloat(e.target.value))
                        }
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) =>
                          updateItem(index, 'discount', parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST (%) *
                      </label>
                      <input
                        type="number"
                        value={item.gstRate}
                        onChange={(e) =>
                          updateItem(index, 'gstRate', parseFloat(e.target.value))
                        }
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <div className="text-sm text-gray-600 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md w-full">
                        <div className="font-medium text-blue-900">
                          ₹{calculateItemTotal(item).toFixed(2)}
                        </div>
                        <div className="text-xs text-blue-700">Line Total</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-3">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove Item
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-4 space-y-2 bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total GST:</span>
                <span className="font-medium">₹{calculateTotalGST().toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span className="font-medium">Overall Discount:</span>
                  <span className="font-medium">- ₹{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2 text-blue-900">
                <span>Grand Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Invoice...' : 'Create Invoice'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

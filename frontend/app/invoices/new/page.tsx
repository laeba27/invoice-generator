'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

type InvoiceItem = {
  itemName: string;
  quantity: number;
  price: number;
  gstRate: number;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([
    { itemName: '', quantity: 1, price: 0, gstRate: 18 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    setItems([...items, { itemName: '', quantity: 1, price: 0, gstRate: 18 }]);
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
    return item.quantity * item.price;
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
    return calculateSubtotal() + calculateTotalGST();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const invoiceData = {
        customerId: selectedCustomerId,
        items: items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price,
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
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information (Optional)
            </h3>

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
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-gray-600">
                      Line Total: ₹{calculateItemTotal(item).toFixed(2)}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total GST:</span>
                <span className="font-medium">₹{calculateTotalGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
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

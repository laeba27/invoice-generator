'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Customer Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Customer creation mode
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    stateCode: '',
    gstin: '',
  });
  
  // Current item being added (Inline row)
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
    itemName: '',
    itemDescription: '',
    quantity: 1,
    price: 0,
    discount: 0,
    gstRate: 18,
  });
  
  // Invoice Fields
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const addItemToList = () => {
    if (!currentItem.itemName) {
      return; 
    }
    setItems([...items, { ...currentItem }]);
    setCurrentItem({
      itemName: '',
      itemDescription: '',
      quantity: 1,
      price: 0,
      discount: 0,
      gstRate: 18,
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const baseTotal = item.quantity * item.price;
    const afterDiscount = baseTotal - item.discount;
    const gstAmount = (afterDiscount * item.gstRate) / 100;
    return afterDiscount + gstAmount;
  };
  
  const calculateItemTax = (item: InvoiceItem) => {
    const baseTotal = item.quantity * item.price;
    const afterDiscount = baseTotal - item.discount;
    return (afterDiscount * item.gstRate) / 100;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price - item.discount), 0);
  };

  const calculateTotalGST = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price - item.discount;
      return sum + (itemTotal * item.gstRate) / 100;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalGST() - totalDiscount;
  };

  const handleCustomerSearch = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    setSelectedCustomerId(null);
    setSelectedCustomerName('');
    setSelectedCustomerData(null);
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(customer.name);
    setSelectedCustomerData(customer);
    setSearchQuery(customer.name);
    setShowDropdown(false);
  };

  const handleAddNewCustomer = () => {
    setNewCustomer({ ...newCustomer, name: searchQuery });
    setShowNewCustomerForm(true);
    setShowDropdown(false);
  };

  const cancelNewCustomer = () => {
    setShowNewCustomerForm(false);
    setSearchQuery('');
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      stateCode: '',
      gstin: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (items.length === 0) {
      setError('Please add at least one item');
      setLoading(false);
      return;
    }

    try {
      let customerId = selectedCustomerId;
      
      if (showNewCustomerForm && newCustomer.name.trim()) {
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
      } else if (!customerId) {
        throw new Error('Please select a customer');
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
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <nav className="mb-8 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <Link
              href="/invoices"
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
           </Link>
           <h1 className="text-2xl font-bold text-gray-800">New Invoice</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold text-white shadow-md transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
      </nav>

      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden animate-fade-in">
        {/* Document Header Region */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            
            {/* Left: Customer Selection (Bill To) */}
            <div className="flex-1 max-w-md">
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                 Bill To
               </label>
               
               {!showNewCustomerForm ? (
                 <div className="relative" ref={dropdownRef}>
                   {!selectedCustomerData ? (
                     <>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Select or type customer name..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                          <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        {showDropdown && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {filteredCustomers.map((customer) => (
                              <button
                                key={customer.id}
                                onClick={() => selectCustomer(customer)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition"
                              >
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                <div className="text-xs text-gray-500 truncate">{customer.email || customer.phone}</div>
                              </button>
                            ))}
                            
                            {searchQuery && (
                              <button
                                onClick={handleAddNewCustomer}
                                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center transition"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create new customer &quot;{searchQuery}&quot;
                              </button>
                            )}
                          </div>
                        )}
                     </>
                   ) : (
                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 relative group">
                        <button
                          onClick={() => {
                            setSelectedCustomerData(null);
                            setSelectedCustomerId(null);
                            setSearchQuery('');
                          }}
                          className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          Change
                        </button>
                        <div className="font-bold text-gray-900 text-lg">{selectedCustomerData.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedCustomerData.address && <div>{selectedCustomerData.address}, {selectedCustomerData.city}</div>}
                          {selectedCustomerData.email && <div>{selectedCustomerData.email}</div>}
                          {selectedCustomerData.phone && <div>{selectedCustomerData.phone}</div>}
                          {selectedCustomerData.gstin && <div className="mt-1 text-xs font-medium text-gray-500">GSTIN: {selectedCustomerData.gstin}</div>}
                        </div>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-medium text-gray-700">New Customer</span>
                       <button onClick={cancelNewCustomer} className="text-xs text-red-500 hover:underline">Cancel</button>
                    </div>
                    <div>
                      <input 
                        placeholder="Name" 
                        value={newCustomer.name} 
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded text-sm mb-2"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          placeholder="Phone" 
                          value={newCustomer.phone} 
                          onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                         <input 
                          placeholder="Email" 
                          value={newCustomer.email} 
                          onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                      <input 
                          placeholder="GSTIN (Optional)" 
                          value={newCustomer.gstin} 
                          onChange={e => setNewCustomer({...newCustomer, gstin: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm mt-2"
                        />
                    </div>
                 </div>
               )}
            </div>

            {/* Right: Invoice Meta */}
            <div className="flex-1 max-w-sm space-y-4">
               <div className="flex items-center gap-4">
                 <label className="w-32 text-right text-xs font-semibold text-gray-500 uppercase">Title</label>
                 <input
                    type="text"
                    value={invoiceTitle}
                    onChange={(e) => setInvoiceTitle(e.target.value)}
                    placeholder="e.g. Consulting Invoice"
                    className="flex-1 px-3 py-2 border-b border-gray-200 focus:border-blue-500 outline-none text-right font-medium transition"
                 />
               </div>
               <div className="flex items-center gap-4">
                 <label className="w-32 text-right text-xs font-semibold text-gray-500 uppercase">Issue Date</label>
                 <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="flex-1 px-3 py-2 border-b border-gray-200 focus:border-blue-500 outline-none text-right font-medium transition"
                 />
               </div>
               <div className="flex items-center gap-4">
                 <label className="w-32 text-right text-xs font-semibold text-gray-500 uppercase">Due Date</label>
                 <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="flex-1 px-3 py-2 border-b border-gray-200 focus:border-blue-500 outline-none text-right font-medium transition"
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Items Table Section */}
        <div className="p-8">
           <table className="w-full table-fixed">
             <thead>
               <tr className="text-left text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                 <th className="pb-3 w-[35%]">Item & Description</th>
                 <th className="pb-3 w-[10%] text-right">Qty</th>
                 <th className="pb-3 w-[15%] text-right">Price</th>
                 <th className="pb-3 w-[12%] text-right">GST %</th>
                 <th className="pb-3 w-[12%] text-right">Discount</th>
                 <th className="pb-3 w-[12%] text-right">Total</th>
                 <th className="pb-3 w-[4%]"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {/* Existing Items */}
               {items.map((item, index) => (
                 <tr key={index} className="group">
                   <td className="py-4 align-top">
                     <div className="font-medium text-gray-900">{item.itemName}</div>
                     {item.itemDescription && <div className="text-sm text-gray-500 mt-1">{item.itemDescription}</div>}
                   </td>
                   <td className="py-4 text-right align-top text-gray-700">{item.quantity}</td>
                   <td className="py-4 text-right align-top text-gray-700">{item.price.toFixed(2)}</td>
                   <td className="py-4 text-right align-top text-xs text-gray-500">
                     {item.gstRate}% <br/>
                     <span className="text-gray-400">({formatCurrency(calculateItemTax(item))})</span>
                   </td>
                   <td className="py-4 text-right align-top text-gray-700">{item.discount > 0 ? item.discount.toFixed(2) : '-'}</td>
                   <td className="py-4 text-right align-top font-medium text-gray-900">{formatCurrency(calculateItemTotal(item))}</td>
                   <td className="py-4 text-center align-top">
                     <button
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        title="Remove item"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </td>
                 </tr>
               ))}

               {/* Input Row for New Item */}
               <tr className="bg-gray-50/50">
                 <td className="py-3 pr-2">
                   <input
                    type="text"
                    placeholder="Item name"
                    value={currentItem.itemName}
                    onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium mb-1"
                   />
                   <input
                    type="text"
                    placeholder="Description (optional)"
                    value={currentItem.itemDescription}
                    onChange={(e) => setCurrentItem({ ...currentItem, itemDescription: e.target.value })}
                    className="w-full px-3 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                   />
                 </td>
                 <td className="py-3 px-1">
                   <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 1 })}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm text-right"
                   />
                 </td>
                 <td className="py-3 px-1">
                   <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm text-right"
                   />
                 </td>
                 <td className="py-3 px-1">
                    <select
                      value={currentItem.gstRate}
                      onChange={(e) => setCurrentItem({ ...currentItem, gstRate: parseFloat(e.target.value) })}
                      className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm text-right appearance-none"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                 </td>
                 <td className="py-3 px-1">
                   <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentItem.discount}
                    onChange={(e) => setCurrentItem({ ...currentItem, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm text-right"
                   />
                 </td>
                 <td className="py-3 text-right font-medium text-gray-500 text-sm align-middle px-2">
                   {formatCurrency(calculateItemTotal(currentItem))}
                 </td>
                 <td className="py-3 text-center align-middle">
                   <button
                    onClick={addItemToList}
                    className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm"
                    title="Add Item"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                   </button>
                 </td>
               </tr>
             </tbody>
           </table>
           
           {items.length === 0 && (
             <div className="text-center py-8 text-gray-400 text-sm">
               Start adding items to your invoice above
             </div>
           )}
        </div>

        {/* Footer Section */}
        <div className="bg-gray-50 p-8 border-t border-gray-100">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Terms, conditions, payment details..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>}
             </div>
             
             <div className="space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>Subtotal</span>
                   <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                   <span>GST Total</span>
                   <span className="font-medium">{formatCurrency(calculateTotalGST())}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm items-center">
                   <span>Overall Discount</span>
                   <div className="w-24">
                      <input
                        type="number"
                        value={totalDiscount}
                        onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-right border border-gray-200 rounded text-sm focus:border-blue-500 outline-none"
                      />
                   </div>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                   <span className="text-lg font-bold text-gray-900">Total</span>
                   <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

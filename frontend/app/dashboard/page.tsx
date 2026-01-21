'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
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
        router.push('/login');
        return;
      }
      setBusiness(businessData);

      // Try to load invoices
      try {
        const invoiceData = await apiClient.getAllInvoices();
        setInvoices(invoiceData || []);
      } catch (err) {
        console.log('No invoices yet');
        setInvoices([]);
      }
    } catch (err) {
      console.error('Error loading business:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-lavender to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate analytics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-lavender to-pastel-pink">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-lg text-gray-700">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Invoices */}
          <div className="bg-gradient-to-br from-pastel-purple to-pastel-lavender rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/80 p-3 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl">📄</span>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Total Invoices</p>
            <p className="text-4xl font-bold text-gray-900">{totalInvoices}</p>
            <p className="text-sm text-gray-600 mt-2">All time</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-pastel-green to-pastel-mint rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/80 p-3 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600 mt-2">All time</p>
          </div>

          {/* Business Status */}
          <div className="bg-gradient-to-br from-pastel-yellow to-pastel-peach rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/80 p-3 rounded-xl">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-3xl">🏢</span>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Business Profile</p>
            <p className="text-2xl font-bold text-gray-900">{business?.businessName || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-2">
              {business?.gstNumber ? 'GST Registered ✓' : 'Not GST Registered'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/invoices/new"
              className="group bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Create Invoice</h3>
                  <p className="text-sm text-white/80">Generate a new GST invoice</p>
                </div>
              </div>
            </Link>

            <Link
              href="/invoices"
              className="group bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">View Invoices</h3>
                  <p className="text-sm text-white/80">Browse all your invoices</p>
                </div>
              </div>
            </Link>

            <Link
              href="/templates"
              className="group bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Templates</h3>
                  <p className="text-sm text-white/80">Design your invoice</p>
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Activity & Business Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Recent Invoices
            </h2>
            {recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {recentInvoices.map((invoice, idx) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="block bg-gradient-to-r from-pastel-blue/30 to-pastel-purple/30 rounded-xl p-4 hover:shadow-lg transform hover:scale-102 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Invoice #{invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{invoice.total?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-600">{invoice.invoiceType}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 mb-4">No invoices yet</p>
                <Link
                  href="/invoices/new"
                  className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create Your First Invoice
                </Link>
              </div>
            )}
          </div>

          {/* Business Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🏢</span>
              Business Details
            </h2>
            {business && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pastel-green/30 to-pastel-mint/30 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Business Name</p>
                  <p className="font-semibold text-gray-900">{business.businessName}</p>
                </div>
                <div className="bg-gradient-to-r from-pastel-purple/30 to-pastel-lavender/30 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-gray-900">{business.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-pastel-yellow/30 to-pastel-peach/30 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{business.phone}</p>
                  </div>
                  <div className="bg-gradient-to-r from-pastel-pink/30 to-pastel-peach/30 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">State Code</p>
                    <p className="font-semibold text-gray-900">{business.stateCode}</p>
                  </div>
                </div>
                {business.gstNumber && (
                  <div className="bg-gradient-to-r from-pastel-blue/30 to-pastel-purple/30 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">GST Number</p>
                    <p className="font-semibold text-gray-900">{business.gstNumber}</p>
                  </div>
                )}
                <Link
                  href="/profile"
                  className="block text-center py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Edit Business Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* New Features Section */}
        <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
            <span className="mr-3">✨</span>
            Recently Added Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎨', title: 'Beautiful UI', desc: 'New vibrant interface with pastel colors' },
              { icon: '📊', title: 'Analytics', desc: 'Track your revenue and invoice stats' },
              { icon: '⚡', title: 'Quick Actions', desc: 'Create invoices faster than ever' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-colors">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/90 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

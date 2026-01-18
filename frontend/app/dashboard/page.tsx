'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    const userData = authService.getUser();
    setUser(userData);

    try {
      const businessData = await apiClient.getBusiness();
      if (!businessData) {
        router.push('/profile');
        return;
      }
      setBusiness(businessData);
    } catch (err) {
      console.error('Error loading business:', err);
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Invoice Generator</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <Link
                href="/profile"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage your invoices and business operations
          </p>
        </div>

        {business && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Business Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Business Name:</p>
                <p className="font-medium">{business.businessName}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{business.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">State Code:</p>
                <p className="font-medium">{business.stateCode}</p>
              </div>
              <div>
                <p className="text-gray-600">GST Number:</p>
                <p className="font-medium">{business.gstNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/invoices/new">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create New Invoice
              </h3>
              <p className="text-gray-600">
                Generate a new GST-compliant invoice for your customers
              </p>
            </div>
          </Link>

          <Link href="/invoices">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                View All Invoices
              </h3>
              <p className="text-gray-600">
                Browse and manage your invoice history
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

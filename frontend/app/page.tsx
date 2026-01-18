'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-blue via-pastel-lavender to-pastel-pink">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-lavender to-pastel-pink">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/30 shadow-lg sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                InvoiceFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
            Create Professional{' '}
            <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              GST Invoices
            </span>
            <br />in Seconds
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            A modern, easy-to-use invoice management system designed for small businesses, 
            shopkeepers, and freelancers. Generate GST-compliant invoices with automatic tax calculations.
          </p>
          <div className="flex justify-center gap-6 mb-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl shadow-2xl hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-300"
            >
              Start Free Today
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-primary-600 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'GST Compliant',
              description: 'Automatic CGST, SGST, and IGST calculations based on state codes',
              color: 'from-pastel-green to-pastel-mint',
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: 'Secure & Private',
              description: 'JWT authentication and encrypted data storage for your business',
              color: 'from-pastel-purple to-pastel-lavender',
            },
            {
              icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Lightning Fast',
              description: 'Generate invoices in seconds with our intuitive interface',
              color: 'from-pastel-yellow to-pastel-peach',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl w-fit mb-4 text-white shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-700 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Key Features Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Manage Invoices
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: '📊', title: 'Business Profile', desc: 'Manage your business information and GST details' },
              { icon: '👥', title: 'Customer Management', desc: 'Store and search customer records easily' },
              { icon: '📄', title: 'Invoice Generation', desc: 'Create professional invoices with line items' },
              { icon: '💰', title: 'Tax Calculation', desc: 'Automatic GST computation for intra/inter-state' },
              { icon: '📈', title: 'Invoice History', desc: 'View and manage all your past invoices' },
              { icon: '🚀', title: 'Quick Actions', desc: 'Create invoices for walk-in customers instantly' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-4 p-6 rounded-xl hover:bg-white/60 transition-all duration-200"
              >
                <span className="text-4xl">{item.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-16 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Simplify Your Invoicing?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust InvoiceFlow for their invoicing needs
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/30 backdrop-blur-md mt-20 py-8 border-t border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-700">
            © 2026 InvoiceFlow. Built with ❤️ for small businesses and freelancers.
          </p>
        </div>
      </footer>
    </div>
  );
}

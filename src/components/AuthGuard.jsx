import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * AuthGuard - protects pages by role
 * @param {string} requiredRole - "admin" | "customer" | "any" (any authenticated user)
 * @param {React.ReactNode} children
 */
export default function AuthGuard({ requiredRole = 'any', children }) {
  const [state, setState] = useState('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Admin pages use sessionStorage auth
    if (requiredRole === 'admin') {
      const adminToken = sessionStorage.getItem('inaya_admin_session');
      if (adminToken === 'authenticated') {
        setState('authorized');
      } else {
        setState('redirecting');
        window.location.href = createPageUrl('AdminLogin');
      }
      return;
    }

    // Customer/any auth uses Base44 SDK
    try {
      const user = await base44.auth.me();
      if (user) {
        setState('authorized');
      } else {
        setState('redirecting');
        window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    } catch {
      setState('redirecting');
      window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  if (state === 'loading' || state === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {state === 'redirecting' ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return children;
}

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * AuthGuard - protects pages by role
 * @param {string} requiredRole - "admin" | "customer" | "any" (any authenticated user)
 * @param {React.ReactNode} children
 */
export default function AuthGuard({ requiredRole = 'any', children }) {
  const [state, setState] = useState('loading'); // loading | authorized | redirecting

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      setState('redirecting');
      if (requiredRole === 'admin') {
        // Unauthenticated admin access → send to AdminLogin
        window.location.href = createPageUrl('AdminLogin');
      } else {
        // Regular user → send to platform login, then back to Customer Dashboard
        base44.auth.redirectToLogin(createPageUrl('Dashboard'));
      }
      return;
    }

    const user = await base44.auth.me();

    if (requiredRole === 'any') {
      setState('authorized');
      return;
    }

    if (requiredRole === 'admin' && user.role !== 'admin') {
      setState('redirecting');
      window.location.href = createPageUrl('Dashboard');
      return;
    }

    if (requiredRole === 'customer' && user.role === 'admin') {
      setState('redirecting');
      window.location.href = createPageUrl('AdminDashboard');
      return;
    }

    setState('authorized');
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
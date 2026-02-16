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
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        // Not logged in — redirect to login
        setState('redirecting');
        if (requiredRole === 'admin') {
          window.location.href = createPageUrl('AdminLogin');
        } else {
          base44.auth.redirectToLogin(window.location.href);
        }
        return;
      }

      const user = await base44.auth.me();

      if (requiredRole === 'any') {
        setState('authorized');
        return;
      }

      if (requiredRole === 'admin' && user.role !== 'admin') {
        // Non-admin trying to access admin page
        setState('redirecting');
        window.location.href = createPageUrl('Dashboard');
        return;
      }

      if (requiredRole === 'customer' && user.role === 'admin') {
        // Admin trying to access customer-only page
        setState('redirecting');
        window.location.href = createPageUrl('AdminDashboard');
        return;
      }

      setState('authorized');
    } catch (error) {
      // Auth check failed — redirect to login
      setState('redirecting');
      if (requiredRole === 'admin') {
        window.location.href = createPageUrl('AdminLogin');
      } else {
        base44.auth.redirectToLogin(window.location.href);
      }
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
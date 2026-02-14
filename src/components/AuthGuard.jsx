import React, { useState, useEffect, useRef } from 'react';
import clientAuth from '@/lib/clientAuth';
import { createPageUrl } from '@/utils';

/**
 * AuthGuard - protects pages by role
 * @param {string} requiredRole - "admin" | "customer" | "any"
 * @param {React.ReactNode} children
 */
export default function AuthGuard({ requiredRole = 'any', children }) {
  const hasChecked = useRef(false);
  
  // For admin, check sessionStorage synchronously to prevent any flicker
  if (requiredRole === 'admin') {
    const adminToken = sessionStorage.getItem('inaya_admin_session');
    if (adminToken !== 'authenticated' && !hasChecked.current) {
      hasChecked.current = true;
      window.location.href = createPageUrl('AdminLogin');
      return null;
    }
    // Authorized admin - render immediately without loading state
    return children;
  }

  // For customer auth, use async check with state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkCustomerAuth = async () => {
      try {
        const user = await clientAuth.me();
        if (user && mounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        } else if (mounted) {
          window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      } catch {
        if (mounted) {
          window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    };

    checkCustomerAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : null;
}

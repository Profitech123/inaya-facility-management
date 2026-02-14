import React, { useState, useEffect } from 'react';
import clientAuth from '@/lib/clientAuth';
import { createPageUrl } from '@/utils';

/**
 * AuthGuard - protects pages by role
 * @param {string} requiredRole - "admin" | "customer" | "any"
 * @param {React.ReactNode} children
 */
export default function AuthGuard({ requiredRole = 'any', children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      // Admin pages use sessionStorage auth
      if (requiredRole === 'admin') {
        const adminToken = sessionStorage.getItem('inaya_admin_session');
        if (adminToken === 'authenticated') {
          if (mounted) {
            setIsAuthorized(true);
            setIsChecking(false);
          }
        } else {
          window.location.href = createPageUrl('AdminLogin');
        }
        return;
      }

      // Customer/any auth uses clientAuth
      try {
        const user = await clientAuth.me();
        if (user && mounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        } else {
          window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      } catch {
        window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [requiredRole]);

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

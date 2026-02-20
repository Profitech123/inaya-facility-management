import React, { useState, useEffect } from 'react';
import clientAuth from '@/lib/clientAuth';
import { createPageUrl } from '@/utils';

/**
 * AuthGuard - protects pages by role.
 * Admin auth is synchronous (sessionStorage), customer auth is async.
 * Hooks are always called in the same order to avoid React violations.
 */
export default function AuthGuard({ requiredRole = 'any', children }) {
  const isAdmin = requiredRole === 'admin';
  
  // Synchronous admin check - read once, no state needed
  const adminOk = isAdmin && sessionStorage.getItem('inaya_admin_session') === 'authenticated';

  // Customer auth state - hooks always called regardless of role
  const [customerOk, setCustomerOk] = useState(false);
  const [checking, setChecking] = useState(!isAdmin);

  useEffect(() => {
    if (isAdmin) return; // Skip async check for admin
    let mounted = true;
    clientAuth.me()
      .then(user => {
        if (!mounted) return;
        if (user) { setCustomerOk(true); setChecking(false); }
        else window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      })
      .catch(() => {
        if (mounted) window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      });
    return () => { mounted = false; };
  }, [isAdmin]);

  // Admin path - synchronous, no loading state
  if (isAdmin) {
    if (adminOk) return children;
    window.location.href = createPageUrl('AdminLogin');
    return null;
  }

  // Customer path
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(40,20%,98%)' }}>
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return customerOk ? children : null;
}

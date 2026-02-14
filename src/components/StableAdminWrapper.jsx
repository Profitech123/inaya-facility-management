import React from 'react';
import { createPageUrl } from '@/utils';

/**
 * StableAdminWrapper - Immediately checks admin auth and prevents any rendering until confirmed
 * This prevents flicker by blocking the initial render completely
 */
export default function StableAdminWrapper({ children }) {
  // Synchronous check - no state, no effects, no flicker
  const isAdminAuthenticated = typeof window !== 'undefined' && 
    sessionStorage.getItem('inaya_admin_session') === 'authenticated';

  // If not authenticated, redirect immediately before any render
  if (!isAdminAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = createPageUrl('AdminLogin');
    }
    // Return minimal loading state during redirect
    return (
      <div className="fixed inset-0 bg-slate-50" />
    );
  }

  // Authenticated - render children immediately
  return <>{children}</>;
}

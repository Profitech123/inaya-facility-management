import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Hidden admin entry page - not linked anywhere in the public UI.
 * Admins can bookmark this page. It redirects to AdminDashboard if already logged in as admin,
 * or shows a login button that redirects back here after auth.
 */
export default function AdminLogin() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user.role === 'admin') {
          window.location.href = createPageUrl('AdminDashboard');
          return;
        }
      }
    } catch (error) {
      // Expected error when not authenticated
    }
    setChecking(false);
  };

  const handleLogin = () => {
    // After login, come back to this page which will redirect admin to dashboard
    base44.auth.redirectToLogin(window.location.href);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="max-w-sm w-full mx-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400 text-sm mb-6">
            INAYA Facilities Management — Staff Access
          </p>
          <Button 
            onClick={handleLogin} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
          >
            Sign In
          </Button>
          <p className="text-slate-600 text-xs mt-4">
            This page is restricted to authorized staff only.
          </p>
        </div>
      </div>
    </div>
  );
}
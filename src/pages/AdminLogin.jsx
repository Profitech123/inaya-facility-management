import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const [checking, setChecking] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      console.log('[v0] AdminLogin - Checking authentication...');
      const isAuth = await base44.auth.isAuthenticated();
      console.log('[v0] AdminLogin - isAuthenticated:', isAuth);
      
      if (isAuth) {
        const user = await base44.auth.me();
        console.log('[v0] AdminLogin - User data:', user);
        console.log('[v0] AdminLogin - User role:', user?.role);
        
        if (user?.role === 'admin') {
          console.log('[v0] AdminLogin - Admin user detected, redirecting to dashboard');
          window.location.href = createPageUrl('AdminDashboard');
          return;
        }
        // Non-admin user tried admin login — show access denied
        console.log('[v0] AdminLogin - Non-admin user detected, showing access denied');
        setDenied(true);
        setChecking(false);
        return;
      }
      console.log('[v0] AdminLogin - User not authenticated');
    } catch (error) {
      console.error('[v0] AdminLogin - Auth check error:', error);
    }
    setChecking(false);
  };

  const handleLogin = () => {
    // After platform login, return to AdminLogin — checkExistingAuth will route admin to dashboard
    const returnUrl = createPageUrl('AdminLogin');
    console.log('[v0] AdminLogin - Redirecting to login with return URL:', returnUrl);
    base44.auth.redirectToLogin(returnUrl);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="max-w-sm w-full mx-4">
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400 text-sm mb-6">
              Your account does not have admin privileges. Please contact your administrator if you believe this is an error.
            </p>
            <div className="space-y-2">
              <Link to={createPageUrl('AdminUserDebug')}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 mb-2">
                  View Debug Info
                </Button>
              </Link>
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to My Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="max-w-sm w-full mx-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
            alt="INAYA" 
            className="h-10 mx-auto mb-6 opacity-80"
          />
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400 text-sm mb-6">
            INAYA Facilities Management — Staff Access Only
          </p>
          <Button 
            onClick={handleLogin} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 mb-3"
          >
            Staff Sign In
          </Button>
          <Link to={createPageUrl('AdminUserDebug')}>
            <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-800 h-9 text-xs">
              Troubleshoot Access Issues
            </Button>
          </Link>
          <p className="text-slate-600 text-xs mt-5">
            This page is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}

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
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user?.role === 'admin') {
          window.location.href = createPageUrl('AdminDashboard');
          return;
        }
        setDenied(true);
        setChecking(false);
        return;
      }
    } catch (error) {
      // Not authenticated
    }
    setChecking(false);
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('AdminLogin'));
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
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to My Dashboard
              </Button>
            </Link>
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
          >
            Staff Sign In
          </Button>
          <p className="text-slate-600 text-xs mt-5">
            This page is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
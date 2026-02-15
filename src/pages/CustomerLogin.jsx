import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { UserCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CustomerLogin() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        // Redirect authenticated users to their dashboard
        if (user?.role === 'admin') {
          window.location.href = createPageUrl('AdminDashboard');
        } else {
          window.location.href = createPageUrl('Dashboard');
        }
        return;
      }
    } catch (error) {
      // Not authenticated, show login page
    }
    setChecking(false);
  };

  const handleLogin = () => {
    // After platform login, return to customer dashboard
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-sm w-full mx-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
            alt="INAYA" 
            className="h-10 mx-auto mb-6"
          />
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <UserCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600 text-sm mb-6">
            Sign in to access your facility management dashboard
          </p>
          <Button 
            onClick={handleLogin} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
          >
            Sign In / Create Account
          </Button>
          <div className="mt-6 pt-6 border-t border-slate-200">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-slate-500 text-xs mb-2">Are you a staff member?</p>
            <Link to={createPageUrl('AdminLogin')}>
              <Button variant="outline" size="sm" className="text-slate-700 border-slate-300 hover:bg-slate-50">
                Staff Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

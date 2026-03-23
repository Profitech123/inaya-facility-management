import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Home } from 'lucide-react';

export default function UserLogin() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already logged in, enforce role redirect
    base44.auth.isAuthenticated().then(async (isAuth) => {
      if (isAuth) {
        const user = await base44.auth.me();
        if (user.role === 'admin') {
          // Admin trying to use customer login → send to admin portal
          window.location.href = createPageUrl('AdminDashboard');
        } else {
          // Customer already logged in → send to dashboard
          window.location.href = createPageUrl('Dashboard');
        }
      } else {
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, []);

  const handleLogin = () => {
    // After login, come back here so we can enforce the redirect
    base44.auth.redirectToLogin(window.location.href);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-14 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-1 text-sm">Sign in to your customer account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="space-y-1 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Customer Portal</h2>
            <p className="text-sm text-slate-500">Book services, track jobs, and manage your properties</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:-translate-y-0.5"
          >
            Sign In / Create Account
          </button>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
            Are you an admin?{' '}
            <Link to="/AdminLogin" className="text-slate-600 font-medium hover:text-slate-900 underline underline-offset-2">
              Admin Login →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 INAYA Facilities Management Services L.L.C.
        </p>
      </div>
    </div>
  );
}
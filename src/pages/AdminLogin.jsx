import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already logged in, enforce role redirect
    base44.auth.isAuthenticated().then(async (isAuth) => {
      if (isAuth) {
        const user = await base44.auth.me();
        if (user.role === 'admin') {
          // Admin logged in → send to admin dashboard
          window.location.href = createPageUrl('AdminDashboard');
        } else {
          // Regular user trying admin login → redirect to customer portal
          window.location.href = createPageUrl('Dashboard');
        }
      } else {
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, []);

  const handleLogin = () => {
    // After login, come back here so we can enforce the role-based redirect
    base44.auth.redirectToLogin(window.location.href);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-14 mx-auto mb-4 brightness-0 invert"
          />
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 mt-1 text-sm">Restricted access — authorized personnel only</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="space-y-1 text-center">
            <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <ShieldCheck className="w-7 h-7 text-slate-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">Administrator Sign In</h2>
            <p className="text-sm text-slate-400">Manage bookings, technicians, services, and reports</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
          >
            Sign In as Admin
          </button>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-white/10">
            Not an admin?{' '}
            <Link to="/UserLogin" className="text-slate-300 font-medium hover:text-white underline underline-offset-2">
              Customer Login →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 INAYA Facilities Management Services L.L.C.
        </p>
      </div>
    </div>
  );
}
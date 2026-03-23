import React from 'react';
import { base44 } from '@/api/base44Client';

export default function TechnicianLogin() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-10 mx-auto mb-6 brightness-0 invert"
          />
          <h1 className="text-2xl font-bold text-white">Technician Portal</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to access your schedule and jobs</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.origin + '/ProviderDashboard')}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
          >
            Sign In with INAYA Account
          </button>

          <p className="text-center text-slate-500 text-xs mt-6">
            Don't have an account? Contact your administrator at{' '}
            <a href="mailto:info@inaya.ae" className="text-emerald-400 hover:underline">info@inaya.ae</a>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-8">
          This portal is for INAYA field technicians only.
        </p>
      </div>
    </div>
  );
}
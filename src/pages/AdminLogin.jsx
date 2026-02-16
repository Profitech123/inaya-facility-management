import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Admin Login — separate auth flow from customer.
 * Uses real Supabase auth + checks the profile role === 'admin'.
 */
export default function AdminLogin() {
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    let cancelled = false;

    const checkExistingAuth = async () => {
      try {
        const isAdmin = localStorage.getItem('inaya_admin_session') === 'true';
        const isAuth = await base44.auth.isAuthenticated();
        if (!cancelled && isAdmin && isAuth) {
          window.location.href = createPageUrl('AdminDashboard');
          return;
        }
      } catch (err) {
        // Not authenticated — show login form
      }
      if (!cancelled) setChecking(false);
    };

    checkExistingAuth();
    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await base44.auth.adminLogin(form.email, form.password);
      window.location.href = createPageUrl('AdminDashboard');
    } catch (err) {
      const msg = err?.message || 'Invalid credentials or insufficient privileges.';
      // Ignore abort errors from React strict mode
      if (msg.includes('abort')) {
        console.warn('AdminLogin: ignoring abort signal, retrying...');
        try {
          await base44.auth.adminLogin(form.email, form.password);
          window.location.href = createPageUrl('AdminDashboard');
          return;
        } catch (retryErr) {
          setError(retryErr?.message || 'Login failed. Please try again.');
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-1">
              INAYA Facilities Management — Staff Access
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@inaya.ae"
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-slate-600 text-xs mt-5 text-center">
            This page is restricted to authorized staff only.
          </p>
        </div>
      </div>
    </div>
  );
}
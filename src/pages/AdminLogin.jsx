import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { Shield, Eye, EyeOff, Lock, User, Loader2, ArrowRight } from 'lucide-react';

const ADMIN_USERNAME = 'admin@inaya.ae';
const ADMIN_PASSWORD = 'Inaya@2026';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('inaya_admin_session');
    if (adminToken === 'authenticated') {
      window.location.href = createPageUrl('AdminDashboard');
      return;
    }
    setChecking(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('inaya_admin_session', 'authenticated');
      window.location.href = createPageUrl('AdminDashboard');
    } else {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
        <div className="w-8 h-8 border-2 border-[hsl(160,60%,45%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-10 mb-16"
          />
          <h1 className="text-4xl font-serif font-bold text-white leading-tight mb-4">
            Admin<br />Command Center
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm">
            Manage bookings, subscriptions, technicians, and analytics from one unified dashboard.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[hsl(160,60%,45%)]">5K+</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Homes Served</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[hsl(160,60%,45%)]">4.9</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Rating</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[hsl(160,60%,45%)]">15+</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Years</div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(160,60%,38%)] to-[hsl(160,80%,28%)] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[hsl(160,60%,38%)]/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Welcome back</h2>
            <p className="text-white/40 text-sm">Sign in to access the admin portal</p>
          </div>

          {/* Demo Credentials */}
          <div className="rounded-xl p-4 mb-8 border border-[hsl(160,60%,38%)]/20" style={{ backgroundColor: 'hsl(160,60%,38%,0.05)' }}>
            <p className="text-[hsl(160,60%,45%)] text-xs font-semibold mb-2 uppercase tracking-wider">Demo Access</p>
            <div className="flex items-center justify-between">
              <code className="text-[hsl(160,60%,60%)] text-xs">admin@inaya.ae</code>
              <code className="text-[hsl(160,60%,60%)] text-xs">Inaya@2026</code>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-4 mb-6 border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="admin-user" className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="admin-user"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@inaya.ae"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent transition-all"
                  style={{ backgroundColor: 'hsl(210,18%,10%)' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent transition-all"
                  style={{ backgroundColor: 'hsl(210,18%,10%)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(160,60%,38%)]/20 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-white/20 text-xs mt-8 text-center">
            Restricted to authorized INAYA staff only
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import clientAuth from '@/lib/clientAuth';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login';
  const returnUrl = params.get('returnUrl') || createPageUrl('Home');

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    clientAuth.me()
      .then(() => { window.location.href = returnUrl; })
      .catch(() => { setCheckingAuth(false); });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await clientAuth.loginViaEmailPassword(email, password);
      window.location.href = returnUrl;
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await clientAuth.register({ email, password, full_name: fullName });
      await clientAuth.loginViaEmailPassword(email, password);
      window.location.href = returnUrl;
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await clientAuth.resetPasswordRequest(email);
      setMode('reset-sent');
    } catch (err) {
      setError(err.message || 'Failed to process request.');
    } finally { setLoading(false); }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
        <div className="w-8 h-8 border-2 border-[hsl(160,60%,38%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full pl-11 pr-4 py-3.5 border border-[hsl(40,10%,88%)] rounded-xl text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent transition-all bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href={createPageUrl('Home')}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
              alt="INAYA Facilities Management"
              className="h-10 mx-auto mb-6"
            />
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-[hsl(40,10%,90%)] p-8 lg:p-10 shadow-xl shadow-black/[0.03]">
          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <h1 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] text-center mb-1">Welcome back</h1>
              <p className="text-[hsl(210,10%,55%)] text-sm text-center mb-8">Sign in to your INAYA account</p>

              {error && <div className="rounded-xl p-4 mb-6 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,10%,70%)]" />
                    <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-[hsl(210,10%,45%)] uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="text-xs text-[hsl(160,60%,38%)] hover:text-[hsl(160,60%,30%)] font-semibold">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,10%,70%)]" />
                    <input id="login-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className={`${inputClass} !pr-12`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(210,10%,70%)] hover:text-[hsl(210,10%,45%)]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              <p className="text-center text-sm text-[hsl(210,10%,55%)] mt-8">
                {"Don't have an account? "}
                <button onClick={() => { setMode('register'); setError(''); }} className="text-[hsl(160,60%,38%)] hover:text-[hsl(160,60%,30%)] font-semibold">Create Account</button>
              </p>
            </>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <>
              <h1 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] text-center mb-1">Create Account</h1>
              <p className="text-[hsl(210,10%,55%)] text-sm text-center mb-8">Join INAYA for hassle-free maintenance</p>

              {error && <div className="rounded-xl p-4 mb-6 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,10%,70%)]" />
                    <input id="reg-name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,10%,70%)]" />
                    <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,10%,70%)]" />
                    <input id="reg-password" type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className={`${inputClass} !pr-12`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(210,10%,70%)] hover:text-[hsl(210,10%,45%)]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              <p className="text-center text-sm text-[hsl(210,10%,55%)] mt-8">
                {'Already have an account? '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-[hsl(160,60%,38%)] hover:text-[hsl(160,60%,30%)] font-semibold">Sign In</button>
              </p>
            </>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <>
              <button onClick={() => { setMode('login'); setError(''); }} className="flex items-center gap-1.5 text-sm text-[hsl(210,10%,55%)] hover:text-[hsl(210,20%,10%)] mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
              <h1 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] text-center mb-1">Reset Password</h1>
              <p className="text-[hsl(210,10%,55%)] text-sm text-center mb-8">{"Enter your email to receive a reset link"}</p>
              {error && <div className="rounded-xl p-4 mb-6 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,10%,70%)]" />
                    <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {/* RESET SENT */}
          {mode === 'reset-sent' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'hsl(160,60%,38%,0.1)' }}>
                <CheckCircle className="w-8 h-8 text-[hsl(160,60%,38%)]" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] mb-2">Check your email</h1>
              <p className="text-[hsl(210,10%,55%)] text-sm mb-8">
                {"If an account exists for "}<span className="font-semibold text-[hsl(210,20%,10%)]">{email}</span>{", you will receive a reset link."}
              </p>
              <button onClick={() => { setMode('login'); setError(''); }} className="w-full py-3.5 rounded-xl text-sm font-semibold border border-[hsl(40,10%,90%)] text-[hsl(210,20%,10%)] hover:bg-[hsl(40,15%,96%)] transition-all">Back to Sign In</button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[hsl(210,10%,65%)] mt-8">
          {"By continuing, you agree to INAYA's Terms of Service and Privacy Policy."}
        </p>
      </div>
    </div>
  );
}

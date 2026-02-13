import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const initialMode = new URLSearchParams(window.location.search).get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode); // login | register | forgot | reset-sent | verify-otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const check = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
          window.location.href = returnUrl || createPageUrl('Dashboard');
          return;
        }
      } catch {
        // Not authenticated
      }
      setCheckingAuth(false);
    };
    check();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await base44.auth.loginViaEmailPassword(email, password);
      if (access_token) {
        // Store the token
        localStorage.setItem('base44_access_token', access_token);
        localStorage.setItem('token', access_token);
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        window.location.href = returnUrl || createPageUrl('Dashboard');
      }
    } catch (err) {
      const msg = err?.data?.detail || err?.message || 'Invalid email or password.';
      setError(typeof msg === 'string' ? msg : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      // After registration, try logging in directly or show OTP verification
      try {
        const { access_token } = await base44.auth.loginViaEmailPassword(email, password);
        if (access_token) {
          localStorage.setItem('base44_access_token', access_token);
          localStorage.setItem('token', access_token);
          const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
          window.location.href = returnUrl || createPageUrl('Dashboard');
        }
      } catch {
        // Login failed after register, likely needs OTP verification
        setMode('verify-otp');
      }
    } catch (err) {
      const msg = err?.data?.detail || err?.message || 'Registration failed. This email may already be registered.';
      setError(typeof msg === 'string' ? msg : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email, otpCode });
      // After verification, log in
      const { access_token } = await base44.auth.loginViaEmailPassword(email, password);
      if (access_token) {
        localStorage.setItem('base44_access_token', access_token);
        localStorage.setItem('token', access_token);
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        window.location.href = returnUrl || createPageUrl('Dashboard');
      }
    } catch (err) {
      const msg = err?.data?.detail || err?.message || 'Invalid or expired verification code.';
      setError(typeof msg === 'string' ? msg : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await base44.auth.resendOtp(email);
      setError(''); // clear any previous error
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
      setMode('reset-sent');
    } catch (err) {
      const msg = err?.data?.detail || err?.message || 'Failed to send reset email.';
      setError(typeof msg === 'string' ? msg : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href={createPageUrl('Home')}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
              alt="INAYA Facilities Management"
              className="h-12 mx-auto mb-4"
            />
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Welcome back</h1>
              <p className="text-slate-500 text-sm text-center mb-6">Sign in to your INAYA account</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                {"Don't have an account? "}
                <button onClick={() => { setMode('register'); setError(''); }} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Create Account
                </button>
              </p>
            </>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Create Account</h1>
              <p className="text-slate-500 text-sm text-center mb-6">Join INAYA for hassle-free maintenance</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Sign In
                </button>
              </p>
            </>
          )}

          {/* VERIFY OTP */}
          {mode === 'verify-otp' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Verify Your Email</h1>
              <p className="text-slate-500 text-sm text-center mb-6">
                {"We've sent a verification code to "}<span className="font-medium text-slate-700">{email}</span>
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp-code" className="block text-sm font-medium text-slate-700 mb-1.5">Verification Code</label>
                  <input
                    id="otp-code"
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-4">
                {"Didn't receive the code? "}
                <button onClick={handleResendOtp} disabled={loading} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Resend
                </button>
              </p>
            </>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <>
              <button onClick={() => { setMode('login'); setError(''); }} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-1">Reset Password</h1>
              <p className="text-slate-500 text-sm text-center mb-6">
                {"Enter your email and we'll send you a reset link"}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
              </form>
            </>
          )}

          {/* RESET SENT */}
          {mode === 'reset-sent' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h1>
              <p className="text-slate-500 text-sm mb-6">
                {"We've sent a password reset link to "}<span className="font-medium text-slate-700">{email}</span>
              </p>
              <Button onClick={() => { setMode('login'); setError(''); }} variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to INAYA{"'"}s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

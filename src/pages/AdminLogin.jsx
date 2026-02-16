import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const { signIn, me, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkExistingAuth();
    }
  }, [loading]);

  const checkExistingAuth = () => {
    if (isAuthenticated()) {
      const user = me();
      console.log('[v0] AdminLogin - User authenticated:', user);
      
      if (user?.role === 'admin') {
        console.log('[v0] AdminLogin - Admin user, redirecting to dashboard');
        navigate('/AdminDashboard');
      } else {
        console.log('[v0] AdminLogin - Non-admin user, showing access denied');
        setDenied(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setIsSubmitting(false);
        return;
      }

      // Check if user has admin role
      const user = me();
      console.log('[v0] AdminLogin - Signed in user:', user);

      if (user?.role === 'admin') {
        const redirect = searchParams.get('redirect');
        navigate(redirect || '/AdminDashboard');
      } else {
        setDenied(true);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('[v0] AdminLogin - Error:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
            alt="INAYA" 
            className="h-10 mx-auto mb-6 opacity-80"
          />
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2 text-center">Admin Portal</h1>
          <p className="text-slate-400 text-sm mb-6 text-center">
            INAYA Facilities Management — Staff Access Only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
            >
              {isSubmitting ? 'Signing in...' : 'Staff Sign In'}
            </Button>

            <Link to={createPageUrl('AdminUserDebug')}>
              <Button type="button" variant="ghost" className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-800 h-9 text-xs">
                Troubleshoot Access Issues
              </Button>
            </Link>

            <p className="text-slate-600 text-xs mt-5 text-center">
              This page is restricted to authorized personnel only.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

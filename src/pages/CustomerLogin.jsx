import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { UserCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomerLogin() {
  const { signIn, signUp, me, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkExistingAuth();
    }
  }, [loading]);

  const checkExistingAuth = () => {
    if (isAuthenticated()) {
      const user = me();
      
      if (user?.role === 'admin') {
        navigate('/AdminDashboard');
      } else {
        const redirect = searchParams.get('redirect');
        navigate(redirect || '/Dashboard');
      }
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError('');
    setIsSigningIn(true);

    try {
      const { data, error } = await signIn(signInEmail, signInPassword);

      if (error) {
        setSignInError(error.message || 'Invalid email or password');
        setIsSigningIn(false);
        return;
      }

      const user = me();

      if (user?.role === 'admin') {
        navigate('/AdminDashboard');
      } else {
        const redirect = searchParams.get('redirect');
        navigate(redirect || '/Dashboard');
      }
    } catch (err) {
      console.error('[v0] CustomerLogin - Sign in error:', err);
      setSignInError('An unexpected error occurred');
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setIsSigningUp(true);

    try {
      const { data, error } = await signUp(signUpEmail, signUpPassword, {
        full_name: signUpName,
        phone: signUpPhone,
      });

      if (error) {
        setSignUpError(error.message || 'Failed to create account');
        setIsSigningUp(false);
        return;
      }

      setSignUpSuccess(true);
      setIsSigningUp(false);
    } catch (err) {
      console.error('[v0] CustomerLogin - Sign up error:', err);
      setSignUpError('An unexpected error occurred');
      setIsSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (signUpSuccess) {
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
            <h1 className="text-xl font-bold text-slate-900 mb-2">Check Your Email</h1>
            <p className="text-slate-600 text-sm mb-6">
              We've sent you a confirmation email. Please click the link to activate your account.
            </p>
            <Button
              onClick={() => setSignUpSuccess(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png" 
            alt="INAYA" 
            className="h-10 mx-auto mb-6"
          />
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <UserCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2 text-center">Welcome to INAYA</h1>
          <p className="text-slate-600 text-sm mb-6 text-center">
            Sign in or create an account to manage your facility services
          </p>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {signInError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                >
                  {isSigningIn ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {signUpError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {signUpError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (Optional)</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                >
                  {isSigningUp ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center space-y-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <p className="text-slate-500 text-xs mb-2">Are you a staff member?</p>
              <Link to={createPageUrl('AdminLogin')}>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Staff Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const { isAuthenticated, isLoadingAuth } = useAuth();
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState(() => {
        return searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    }); // 'login' | 'signup' | 'verify'
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    // If already logged in, redirect to Dashboard (only after auth check completes)
    useEffect(() => {
        if (!isLoadingAuth && isAuthenticated) {
            const returnUrl = sessionStorage.getItem('inaya_return_url');
            if (returnUrl) {
                sessionStorage.removeItem('inaya_return_url');
                window.location.href = returnUrl;
            } else {
                window.location.href = createPageUrl('Dashboard');
            }
        }
    }, [isLoadingAuth, isAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'login') {
                await base44.auth.signIn({ email: form.email, password: form.password });
                toast.success('Welcome back!');
                const returnUrl = sessionStorage.getItem('inaya_return_url');
                if (returnUrl) {
                    sessionStorage.removeItem('inaya_return_url');
                    window.location.href = returnUrl;
                } else {
                    window.location.href = createPageUrl('Dashboard');
                }
            } else {
                await base44.auth.signUp({
                    email: form.email,
                    password: form.password,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    fullName: `${form.firstName} ${form.lastName}`.trim(),
                    phone: form.phone,
                });
                setMode('verify');
                toast.success('Account created! Check your email to verify.');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    // Show spinner while auth state is being determined (prevents flickering)
    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If authenticated, show redirecting state
    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Redirecting...</p>
                </div>
            </div>
        );
    }

    if (mode === 'verify') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Mail className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h1>
                    <p className="text-slate-500 mb-6">
                        We've sent a verification link to <strong>{form.email}</strong>.
                        Click the link to activate your account.
                    </p>
                    <Button
                        onClick={() => setMode('login')}
                        variant="outline"
                        className="w-full"
                    >
                        Back to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to={createPageUrl('Home')}>
                        <img
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
                            alt="INAYA"
                            className="h-12 mx-auto mb-4"
                        />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {mode === 'login'
                            ? 'Sign in to manage your bookings and services'
                            : 'Join INAYA for premium facility management'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            value={form.firstName}
                                            onChange={(e) => updateForm('firstName', e.target.value)}
                                            placeholder="John"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                                    <Input
                                        value={form.lastName}
                                        onChange={(e) => updateForm('lastName', e.target.value)}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => updateForm('email', e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => updateForm('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => updateForm('phone', e.target.value)}
                                        placeholder="+971 50 123 4567"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-white font-medium"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-emerald-600 font-medium ml-1 hover:text-emerald-700"
                            >
                                {mode === 'login' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    By continuing, you agree to INAYA's{' '}
                    <Link to={createPageUrl('TermsOfService')} className="underline hover:text-slate-600">Terms</Link>
                    {' and '}
                    <Link to={createPageUrl('PrivacyPolicy')} className="underline hover:text-slate-600">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}

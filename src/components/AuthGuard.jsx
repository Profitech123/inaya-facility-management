import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * AuthGuard component that protects routes requiring authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.requiredRole - Optional role required to access the route ('admin', 'provider', 'customer')
 * @param {string} props.redirectTo - Where to redirect if not authenticated (default: '/login')
 */
export function AuthGuard({ children, requiredRole = null, redirectTo = '/login' }) {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        // Not authenticated, redirect to login
        const currentPath = window.location.pathname + window.location.search;
        navigate(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      } else if (requiredRole && profile?.role !== requiredRole) {
        // Authenticated but doesn't have required role
        console.log('[v0] AuthGuard: User does not have required role:', requiredRole, 'User role:', profile?.role);
        
        // Redirect based on user's actual role
        if (profile?.role === 'admin') {
          navigate('/AdminDashboard');
        } else if (profile?.role === 'provider') {
          navigate('/ProviderOnboarding');
        } else {
          navigate('/Dashboard');
        }
      } else {
        // All checks passed
        setIsChecking(false);
      }
    }
  }, [loading, user, profile, isAuthenticated, requiredRole, navigate, redirectTo]);

  // Show loading state while checking auth
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated and has required role
  return <>{children}</>;
}

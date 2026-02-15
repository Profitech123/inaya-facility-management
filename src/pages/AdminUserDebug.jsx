import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUserDebug() {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuth(authenticated);
      console.log('[v0] AdminUserDebug - isAuthenticated:', authenticated);
      
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
        console.log('[v0] AdminUserDebug - User data:', userData);
      }
    } catch (err) {
      console.error('[v0] AdminUserDebug - Error:', err);
      setError(err.message || 'Failed to check authentication');
    }
    setLoading(false);
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleLogout = () => {
    base44.auth.logout(window.location.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin User Debug Panel</h1>
          <p className="text-slate-500">View your current authentication status and user data</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isAuth ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Authenticated
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    Not Authenticated
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuth && (
                <div className="space-y-4">
                  <p className="text-slate-600">You need to sign in to access admin features.</p>
                  <Button onClick={handleLogin} className="bg-emerald-600 hover:bg-emerald-700">
                    Sign In
                  </Button>
                </div>
              )}
              {isAuth && (
                <div className="space-y-4">
                  <p className="text-slate-600">You are currently signed in.</p>
                  <Button onClick={handleLogout} variant="outline">
                    Sign Out
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Data */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>User Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">User ID:</span>
                    <span className="text-slate-900 font-mono text-sm">{user.id || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Email:</span>
                    <span className="text-slate-900 font-mono text-sm">{user.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Role:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.role || 'No role set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Name:</span>
                    <span className="text-slate-900">{user.name || user.first_name || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                About Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm">
                <p className="text-slate-600 mb-4">
                  To access admin features, your user account needs to have the <strong>role</strong> field set to <code className="px-2 py-1 bg-slate-100 rounded text-sm">"admin"</code> in the Base44 system.
                </p>
                
                {user && user.role !== 'admin' && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Admin Role Not Set</AlertTitle>
                    <AlertDescription>
                      Your current role is <strong>"{user.role || 'not set'}"</strong>. To grant admin access:
                      <ol className="list-decimal ml-5 mt-2 space-y-1">
                        <li>Log in to your Base44 dashboard</li>
                        <li>Navigate to Users management</li>
                        <li>Find your user account (ID: {user.id})</li>
                        <li>Set the "role" field to "admin"</li>
                        <li>Save and refresh this page</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                )}

                {user && user.role === 'admin' && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Admin Access Granted</AlertTitle>
                    <AlertDescription>
                      Your account has admin privileges. You can now access the admin dashboard and all management features.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button 
              onClick={checkAuth} 
              variant="outline"
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

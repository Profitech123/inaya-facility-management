import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Fetch user profile data
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[v0] Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[v0] Error in fetchProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          setProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[v0] Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[v0] Sign up error:', error);
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[v0] Sign in error:', error);
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      console.error('[v0] Sign out error:', error);
      return { error };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!session && !!user;
  };

  // Get current user with role information
  const me = () => {
    if (!user || !profile) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: profile.role || 'customer',
      ...profile,
    };
  };

  // Redirect to login (for compatibility with Base44 pattern)
  const redirectToLogin = (returnUrl) => {
    const url = returnUrl || window.location.href;
    window.location.href = `/login?redirect=${encodeURIComponent(url)}`;
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return null;
    const profile = await fetchProfile(user.id);
    setProfile(profile);
    return profile;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated,
    me,
    redirectToLogin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

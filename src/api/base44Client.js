/**
 * base44Client.js — Supabase-backed adapter
 * 
 * Maintains the same `base44.auth`, `base44.entities`, `base44.functions`,
 * `base44.integrations`, and `base44.appLogs` interface so all existing
 * components continue to work without modification.
 */
import { supabase } from './supabaseClient.js';

// ─── Table name mapping ───
// Maps entity names used in code to actual Supabase table names
const TABLE_MAP = {
  User: 'profiles',
  Service: 'services',
  ServiceCategory: 'service_categories',
  ServiceAddon: 'service_addons',
  Booking: 'bookings',
  Property: 'properties',
  Provider: 'providers',
  ProviderReview: 'provider_reviews',
  Subscription: 'subscriptions',
  SubscriptionPackage: 'subscription_packages',
  SupportTicket: 'support_tickets',
  ChatConversation: 'chat_conversations',
  AuditLog: 'audit_logs',
  OnboardingProgress: 'onboarding_progress',
  ContactSubmission: 'contact_submissions',
  Testimonial: 'content_testimonials',
};

// ─── Entity Factory ───
// Creates a CRUD interface for a Supabase table
// ─── Internal Fetch Helper ───
const _request = async (path, options = {}) => {
  const supabaseUrl = 'https://brafoehhxmswiwjlfabo.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYWZvZWhoeG1zd2l3amxmYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTEyMjQsImV4cCI6MjA4NjYyNzIyNH0.azFOLTd0gKDiYP5CUOjZ6Pk_ZvHPkadqAO8-Ha-JCtA';

  const headers = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation', // Ask for the returned object
    ...options.headers
  };

  // Inject Auth Token if available
  try {
    const storageKey = 'sb-brafoehhxmswiwjlfabo-auth-token';
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const session = JSON.parse(stored);
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }
  } catch (e) {
    // ignore
  }

  const res = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Fetch error ${path}:`, res.status, errorBody);
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  // DELETE returns 204 No Content usually, check content-length or text
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ─── Entity Factory (Direct Fetch) ───
const createEntity = (tableName) => ({
  /**
   * @param {string} [sort]
   * @param {number} [limit]
   */
  list: async (sort, limit) => {
    try {
      const params = new URLSearchParams();
      params.append('select', '*');
      if (limit) params.append('limit', limit);
      if (sort && typeof sort === 'string') {
        const desc = sort.startsWith('-');
        const column = desc ? sort.slice(1) : sort;
        params.append('order', `${column}.${desc ? 'desc' : 'asc'}`);
      }

      return await _request(`/rest/v1/${tableName}?${params.toString()}`);
    } catch (e) {
      console.warn(`[${tableName}] list failed:`, e.message);
      return [];
    }
  },

  filter: async (filterObj) => {
    try {
      const params = new URLSearchParams();
      params.append('select', '*');
      if (filterObj && typeof filterObj === 'object') {
        for (const [key, value] of Object.entries(filterObj)) {
          // simple equality check
          params.append(key, `eq.${value}`);
        }
      }
      return await _request(`/rest/v1/${tableName}?${params.toString()}`);
    } catch (e) {
      console.warn(`[${tableName}] filter failed:`, e.message);
      return [];
    }
  },

  /**
   * @param {string} id
   */
  get: async (id) => {
    try {
      const data = await _request(`/rest/v1/${tableName}?id=eq.${id}&select=*&limit=1`);
      return data?.[0] || null;
    } catch (error) {
      console.error(`Error getting ${tableName}/${id}:`, error);
      return null;
    }
  },

  /**
   * @param {object} item
   */
  create: async (item) => {
    try {
      const data = await _request(`/rest/v1/${tableName}`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return data?.[0];
    } catch (error) {
      console.error(`Error creating in ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * @param {string} id
   * @param {object} updates
   */
  update: async (id, updates) => {
    try {
      const data = await _request(`/rest/v1/${tableName}?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return data?.[0];
    } catch (error) {
      console.error(`Error updating ${tableName}/${id}:`, error);
      throw error;
    }
  },

  /**
   * @param {string} id
   */
  delete: async (id) => {
    try {
      await _request(`/rest/v1/${tableName}?id=eq.${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting ${tableName}/${id}:`, error);
      throw error;
    }
  },

  bulkCreate: async (items) => {
    try {
      const data = await _request(`/rest/v1/${tableName}`, {
        method: 'POST',
        body: JSON.stringify(items),
      });
      return data || [];
    } catch (error) {
      console.error(`Error bulk creating in ${tableName}:`, error);
      throw error;
    }
  },
});

// ─── Build entities object ───
const entities = {};
for (const [entityName, tableName] of Object.entries(TABLE_MAP)) {
  entities[entityName] = createEntity(tableName);
}

// ─── Auth adapter ───
// Cache the user profile to avoid repeated network calls
let _cachedProfile = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

const auth = {
  /**
   * Get the current user's profile (with role, full_name, etc.)
   * Uses session (local/fast) first, only hits network if needed.
   */
  me: async () => {
    // Return cached profile if still fresh
    const now = Date.now();
    if (_cachedProfile && (now - _cacheTimestamp) < CACHE_TTL) {
      return _cachedProfile;
    }

    let session = null;
    try {
      const { data } = await supabase.auth.getSession();
      session = data?.session;
    } catch (e) {
      // Ignore SDK errors
    }

    // Fallback: Check localStorage manually if SDK failed
    if (!session) {
      try {
        const local = localStorage.getItem('sb-brafoehhxmswiwjlfabo-auth-token');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.user) {
            session = parsed;
            // Also try to restore session to SDK if possible
            supabase.auth.setSession(parsed).catch(() => { });
          }
        }
      } catch (e) { }
    }

    if (!session?.user) throw { status: 401, message: 'Not authenticated' };

    const user = session.user;

    // Try to fetch the profile (may fail if table doesn't exist yet)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        _cachedProfile = { ...profile, email: user.email };
        _cacheTimestamp = now;
        return _cachedProfile;
      }
    } catch (e) {
      // profiles table might not exist yet — fall through
    }

    // Fallback: return basic auth user info from JWT
    const ADMIN_EMAILS = ['admin@inaya.ae'];
    const fallbackRole = ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? 'admin'
      : (user.email?.startsWith('tech') ? 'technician' : (user.user_metadata?.role || 'customer'));
    _cachedProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      role: fallbackRole,
    };
    _cacheTimestamp = now;
    return _cachedProfile;
  },

  isAuthenticated: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return true;
    } catch (e) { }

    // Fallback: Check localStorage
    const local = localStorage.getItem('sb-brafoehhxmswiwjlfabo-auth-token');
    return !!local;
  },

  logout: async (redirectUrl) => {
    _cachedProfile = null;
    _cacheTimestamp = 0;

    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore SDK errors during signout
    }

    // Clear all auth persistence
    localStorage.removeItem('inaya_admin_session');
    localStorage.removeItem('sb-brafoehhxmswiwjlfabo-auth-token');

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.reload();
    }
  },

  // Alias for admin logout to support existing code in AdminLayout
  adminLogout: async () => {
    // Pass the redirect URL to avoid the default reload
    await auth.logout('/AdminLogin');
  },

  adminLogin: async (email, password) => {
    _cachedProfile = null;
    _cacheTimestamp = 0;

    // Completely bypass Supabase SDK to avoid AbortController issues (v2.95.x)
    const supabaseUrl = 'https://brafoehhxmswiwjlfabo.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYWZvZWhoeG1zd2l3amxmYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTEyMjQsImV4cCI6MjA4NjYyNzIyNH0.azFOLTd0gKDiYP5CUOjZ6Pk_ZvHPkadqAO8-Ha-JCtA';

    // Step 1: Authenticate via direct REST call
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseAnonKey },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.msg || result.error_description || 'Invalid login credentials');
    }

    const user = result.user;

    // Step 2: Verify admin role
    // Check profiles table first, then fall back to email-based check
    const ADMIN_EMAILS = ['admin@inaya.ae'];
    let isAdmin = false;
    try {
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${result.access_token}`,
          },
        }
      );
      const profiles = await profileRes.json();
      if (Array.isArray(profiles) && profiles.length > 0) {
        isAdmin = profiles[0]?.role === 'admin';
      } else {
        // No profile found — check by email as fallback
        isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
        // Try to auto-create the admin profile
        if (isAdmin) {
          fetch(`${supabaseUrl}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${result.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: user.id, full_name: 'Admin', role: 'admin', email: user.email }),
          }).catch(() => { }); // best-effort, don't block login
        }
      }
    } catch (e) {
      // Fallback to email check
      isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());
    }

    if (!isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }

    // Step 3: Store session in localStorage so Supabase SDK picks it up on next page load
    // The SDK stores under: sb-<ref>-auth-token
    const storageKey = 'sb-brafoehhxmswiwjlfabo-auth-token';
    const sessionData = {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      expires_at: result.expires_at,
      token_type: result.token_type,
      user: result.user,
    };
    localStorage.setItem(storageKey, JSON.stringify(sessionData));
    localStorage.setItem('inaya_admin_session', 'true');

    return user;
  },



  signUp: async ({ email, password, fullName, firstName, lastName, phone }) => {
    // Bypass SDK to avoid AbortController issues
    const supabaseUrl = 'https://brafoehhxmswiwjlfabo.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYWZvZWhoeG1zd2l3amxmYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTEyMjQsImV4cCI6MjA4NjYyNzIyNH0.azFOLTd0gKDiYP5CUOjZ6Pk_ZvHPkadqAO8-Ha-JCtA';

    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseAnonKey },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: fullName || `${firstName || ''} ${lastName || ''}`.trim(),
          first_name: firstName || '',
          last_name: lastName || '',
          phone_number: phone || '',
          role: 'customer',
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || data.error_description || 'Signup failed');
    }

    // If signup auto-signs in (returns access_token), store it
    if (data.access_token) {
      const storageKey = 'sb-brafoehhxmswiwjlfabo-auth-token';
      const sessionData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: data.expires_at,
        token_type: data.token_type,
        user: data.user,
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionData));
    }

    return { user: data.user, session: data.access_token ? data : null };
  },

  signIn: async ({ email, password }) => {
    // Bypass SDK to avoid AbortController issues
    const supabaseUrl = 'https://brafoehhxmswiwjlfabo.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYWZvZWhoeG1zd2l3amxmYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTEyMjQsImV4cCI6MjA4NjYyNzIyNH0.azFOLTd0gKDiYP5CUOjZ6Pk_ZvHPkadqAO8-Ha-JCtA';

    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseAnonKey },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || data.error_description || 'Invalid login credentials');
    }

    const storageKey = 'sb-brafoehhxmswiwjlfabo-auth-token';
    const sessionData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      expires_at: data.expires_at,
      token_type: data.token_type,
      user: data.user,
    };
    localStorage.setItem(storageKey, JSON.stringify(sessionData));

    return { user: data.user, session: data, role: data.user.email?.startsWith('tech') ? 'technician' : 'customer' };
  },

  redirectToLogin: (returnUrl) => {
    // Store the return URL and redirect to login page
    if (returnUrl) sessionStorage.setItem('inaya_return_url', returnUrl);
    window.location.href = '/Login';
  },

  redirectToSignup: (returnUrl) => {
    if (returnUrl) sessionStorage.setItem('inaya_return_url', returnUrl);
    window.location.href = '/Login?mode=signup';
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Expose the raw Supabase auth for advanced use
  _supabase: supabase.auth,
};

// ─── Functions adapter (no-op for now) ───
const functions = {
  invoke: async (functionName, params) => {
    console.log(`Function invoke: ${functionName}`, params);
    // In the future, call Supabase Edge Functions:
    // const { data, error } = await supabase.functions.invoke(functionName, { body: params });
    return { success: true };
  },
};

// ─── Integrations adapter ───
const integrations = {
  Core: {
    SendEmail: async (data) => {
      console.log('SendEmail (mock):', data);
      // In the future, call a Supabase Edge Function or external email service
      return { success: true };
    },
  },
};

// ─── App Logs adapter ───
const appLogs = {
  logUserInApp: async (page) => {
    // Silently log — could write to audit_logs table in the future
    console.log('Page visit:', page);
  },
};

// ─── Export the unified interface ───
export const base44 = {
  auth,
  entities: new Proxy(entities, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      // Dynamic fallback for unknown entities
      const tableName = prop.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '') + 's';
      console.warn(`Unknown entity "${String(prop)}", trying table "${tableName}"`);
      return createEntity(tableName);
    },
  }),
  functions,
  integrations,
  appLogs,
};

// Also export supabase directly for components that need it
export { supabase };

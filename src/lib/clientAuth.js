/**
 * Self-contained client-side authentication system.
 * Stores users in localStorage since no backend is available.
 * Provides the same API shape as base44.auth so existing code migrates easily.
 */

const STORAGE_KEYS = {
  USERS: 'inaya_users',
  CURRENT_USER: 'inaya_current_user',
  SESSION: 'inaya_session',
};

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!session) return null;
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
    return user;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION, 'active');
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

function generateId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Simple hash for client-side password storage (not cryptographically secure, but better than plain text)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

/**
 * Client-side auth module.
 * Same method names as base44.auth so existing code works with minimal changes.
 */
const clientAuth = {
  /** Get current logged-in user. Throws if not authenticated. */
  async me() {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }
    return { ...user };
  },

  /** Update current user profile data. */
  async updateMe(data) {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }
    const updatedUser = { ...user, ...data, updated_at: new Date().toISOString() };
    // Also update in users list
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data, updated_at: updatedUser.updated_at };
      saveUsers(users);
    }
    setCurrentUser(updatedUser);
    return updatedUser;
  },

  /** Register a new user. */
  async register({ email, password, full_name = '' }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.status = 400;
      throw error;
    }
    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.status = 400;
      throw error;
    }
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const error = new Error('An account with this email already exists');
      error.status = 409;
      throw error;
    }
    const now = new Date().toISOString();
    const newUser = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      password_hash: simpleHash(password),
      full_name: full_name || email.split('@')[0],
      phone: '',
      profile_image: '',
      role: 'customer',
      created_at: now,
      updated_at: now,
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: sanitizeUser(newUser) };
  },

  /** Log in with email and password. Returns user object and sets session. */
  async loginViaEmailPassword(email, password) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.status = 400;
      throw error;
    }
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }
    if (user.password_hash !== simpleHash(password)) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }
    const safeUser = sanitizeUser(user);
    setCurrentUser(safeUser);
    return { access_token: 'local_' + user.id, user: safeUser };
  },

  /** Check if user is authenticated. */
  async isAuthenticated() {
    try {
      await this.me();
      return true;
    } catch {
      return false;
    }
  },

  /** Log out. Clears session. */
  logout() {
    setCurrentUser(null);
  },

  /** Change password for current user. */
  async changePassword({ currentPassword, newPassword }) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      const error = new Error('Not authenticated');
      error.status = 401;
      throw error;
    }
    const users = getUsers();
    const user = users.find(u => u.id === currentUser.id);
    if (!user || user.password_hash !== simpleHash(currentPassword)) {
      const error = new Error('Current password is incorrect');
      error.status = 401;
      throw error;
    }
    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters');
      error.status = 400;
      throw error;
    }
    user.password_hash = simpleHash(newPassword);
    user.updated_at = new Date().toISOString();
    saveUsers(users);
    return { success: true };
  },

  /** Request password reset (simulated). */
  async resetPasswordRequest(email) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      // Don't reveal if email exists or not
      return { success: true };
    }
    // Store a reset token
    const token = generateId();
    user.reset_token = token;
    user.reset_token_expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    saveUsers(users);
    return { success: true };
  },

  /** Reset password with token (simulated - auto-resets since no email). */
  async resetPassword({ resetToken, newPassword }) {
    const users = getUsers();
    const user = users.find(u => u.reset_token === resetToken);
    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.status = 400;
      throw error;
    }
    user.password_hash = simpleHash(newPassword);
    delete user.reset_token;
    delete user.reset_token_expiry;
    user.updated_at = new Date().toISOString();
    saveUsers(users);
    return { success: true };
  },

  // No-op stubs to prevent errors in code that calls these
  async verifyOtp() { return { success: true }; },
  async resendOtp() { return { success: true }; },
  setToken() {},
  redirectToLogin() {},
};

/** Remove password_hash and internal fields before returning user */
function sanitizeUser(user) {
  const { password_hash, reset_token, reset_token_expiry, ...safe } = user;
  return safe;
}

export default clientAuth;

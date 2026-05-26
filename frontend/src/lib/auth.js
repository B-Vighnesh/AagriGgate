const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const SESSION_STORAGE_KEY = 'aagriggate.session';
const TOKEN_STORAGE_KEY = 'token';

let currentSession = null;

function clearLegacyLocalAuth() {
  try {
    window.localStorage.removeItem('role');
    window.localStorage.removeItem('farmerId');
  } catch {
    // Ignore storage access issues; auth can still fall back to the cookie.
  }
}

function readStoredSession() {
  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    return token ? { token } : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  try {
    if (session?.token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // In-memory auth still works for this tab if storage is unavailable.
  }
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage access issues.
  }
}

function normalizeRole(role) {
  if (!role) return '';
  const upper = String(role).toUpperCase();
  if (upper === 'SELLER') return 'farmer';
  if (upper === 'BUYER') return 'buyer';
  return String(role).toLowerCase();
}

function normalizeSession(session) {
  if (!session) return null;
  const role = normalizeRole(session.role);
  const farmerId = session.farmerId ? String(session.farmerId) : '';
  const token = session.token ? String(session.token) : '';

  if (!role || !farmerId) return null;

  return {
    ...session,
    role,
    farmerId,
    token,
  };
}

export const getToken = () => currentSession?.token || (currentSession ? 'cookie-session' : '');
export const getRole = () => currentSession?.role || '';
export const getFarmerId = () => currentSession?.farmerId || '';
export const getSession = () => currentSession;

export const setAuth = (session) => {
  clearLegacyLocalAuth();
  currentSession = normalizeSession(session);
  writeStoredSession(currentSession);
  window.dispatchEvent(new Event('auth:changed'));
  return currentSession;
};

export const clearAuth = () => {
  clearLegacyLocalAuth();
  clearStoredSession();
  currentSession = null;
  window.dispatchEvent(new Event('auth:changed'));
};

export async function bootstrapSession() {
  clearLegacyLocalAuth();
  const storedSession = readStoredSession();
  const storedToken = storedSession?.token ? String(storedSession.token) : '';

  if (!API_BASE_URL) {
    currentSession = normalizeSession(storedSession);
    return currentSession;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
    });

    if (!response.ok) {
      currentSession = null;
      clearStoredSession();
      return null;
    }

    const session = await response.json();
    return setAuth({ ...session, token: storedToken });
  } catch {
    currentSession = null;
    return null;
  }
}

export const isLoggedIn = () => Boolean(currentSession);

export const hasCompleteSession = () => Boolean(currentSession?.role && currentSession?.farmerId);

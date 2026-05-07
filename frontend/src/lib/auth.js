const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

let currentSession = null;

function clearLegacyLocalAuth() {
  try {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('role');
    window.localStorage.removeItem('farmerId');
  } catch {
    // Ignore storage access issues; cookie auth does not depend on localStorage.
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

  if (!role || !farmerId) return null;

  return {
    ...session,
    role,
    farmerId,
  };
}

export const getToken = () => (currentSession ? 'cookie-session' : '');
export const getRole = () => currentSession?.role || '';
export const getFarmerId = () => currentSession?.farmerId || '';
export const getSession = () => currentSession;

export const setAuth = (session) => {
  clearLegacyLocalAuth();
  currentSession = normalizeSession(session);
  window.dispatchEvent(new Event('auth:changed'));
  return currentSession;
};

export const clearAuth = () => {
  clearLegacyLocalAuth();
  currentSession = null;
  window.dispatchEvent(new Event('auth:changed'));
};

export async function bootstrapSession() {
  clearLegacyLocalAuth();

  if (!API_BASE_URL) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      currentSession = null;
      return null;
    }

    const session = await response.json();
    return setAuth(session);
  } catch {
    currentSession = null;
    return null;
  }
}

export const isLoggedIn = () => Boolean(currentSession);

export const hasCompleteSession = () => Boolean(currentSession?.role && currentSession?.farmerId);

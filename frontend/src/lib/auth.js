/**
 * Auth utilities — single source of truth for reading/writing
 * authentication state in localStorage.
 */

export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role') || '';
export const getFarmerId = () => localStorage.getItem('farmerId') || '';

export const setAuth = ({ token, role, farmerId }) => {
    if (token) localStorage.setItem('token', token);
    if (role) localStorage.setItem('role', role);
    if (farmerId) localStorage.setItem('farmerId', farmerId);
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('farmerId');
};

export const isLoggedIn = () => Boolean(getToken());

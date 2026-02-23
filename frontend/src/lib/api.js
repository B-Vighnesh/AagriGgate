/**
 * Centralised API client for AagriGgate.
 * Reads auth token from localStorage automatically.
 */

export const BASE_URL = 'http://localhost:8080';

/**
 * Wrapper around fetch that auto-attaches the JWT Bearer token.
 * @param {string} path  - e.g. '/users/login'
 * @param {RequestInit} options - standard fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

/**
 * Convenience helpers
 */
export const apiGet  = (path, headers = {}) =>
  apiFetch(path, { method: 'GET', headers });

export const apiPost = (path, body, headers = {}) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body), headers });

export const apiPut  = (path, body, headers = {}) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body), headers });

export const apiDelete = (path, headers = {}) =>
  apiFetch(path, { method: 'DELETE', headers });

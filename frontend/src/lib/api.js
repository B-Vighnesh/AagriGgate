import { clearAuth } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function getAuthToken() {
  return localStorage.getItem('token');
}

function buildHeaders(optionsHeaders = {}, isFormData = false) {
  const token = getAuthToken();
  const headers = { ...optionsHeaders };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function handleUnauthorized() {
  clearAuth();
  window.dispatchEvent(new Event('auth:expired'));
}

async function parseErrorResponse(response) {
  try {
    const body = await response.json();
    if (body?.message) return new ApiError(body.message, response.status, body);
    return new ApiError('Request failed', response.status, body);
  } catch {
    return new ApiError(`Request failed with status ${response.status}`, response.status);
  }
}

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const isFormData = options.body instanceof FormData;
    const headers = buildHeaders(options.headers || {}, isFormData);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401) {
      handleUnauthorized();
    }

    return response;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError('Request timeout. Please try again.', 408);
    }
    throw new ApiError('Network error. Please check your connection.', 0, error);
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestJson(path, options = {}) {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text || null;
}

export const apiGet = (path, headers = {}) =>
  apiFetch(path, { method: 'GET', headers });

export const apiPost = (path, body, headers = {}) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body), headers });

export const apiPut = (path, body, headers = {}) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body), headers });

export const apiDelete = (path, headers = {}) =>
  apiFetch(path, { method: 'DELETE', headers });

export const getApiBaseUrl = () => API_BASE_URL;

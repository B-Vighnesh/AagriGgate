import { requestJson } from './api';

/**
 * Unwraps the API response envelope.
 * Intercepts 403 Forbidden so the UI can display a meaningful access-denied message.
 */
const unwrap = async (promise) => {
  try {
    const response = await promise;
    return response?.data ?? response;
  } catch (error) {
    // Provide a user-friendly message when the backend returns 403 (role mismatch)
    if (error?.status === 403) {
      throw new Error('You do not have permission to access news. Please contact support.');
    }
    throw error;
  }
};

const appendEnumParam = (searchParams, key, value) => {
  if (value == null) {
    return;
  }

  const normalized = String(value).trim();
  if (!normalized || normalized.toUpperCase() === 'ALL') {
    return;
  }

  searchParams.set(key, normalized);
};

const appendTextParam = (searchParams, key, value) => {
  if (value == null) {
    return;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return;
  }

  searchParams.set(key, normalized);
};

export const getNews = (params = {}) => {
  const searchParams = new URLSearchParams();
  appendEnumParam(searchParams, 'category', params.category);
  appendEnumParam(searchParams, 'newsType', params.newsType);
  if (params.language) searchParams.set('language', params.language);
  if (params.isImportant) searchParams.set('isImportant', 'true');
  appendTextParam(searchParams, 'keyword', params.keyword);
  if (params.dateRange && params.dateRange !== 'ALL') searchParams.set('dateRange', params.dateRange);
  searchParams.set('page', String(params.page ?? 0));
  searchParams.set('size', String(params.size ?? 10));
  searchParams.set('sortBy', params.sortBy || 'newest');
  return unwrap(requestJson(`/news?${searchParams.toString()}`, { method: 'GET' }));
};

export const getNewsById = (id) =>
  unwrap(requestJson(`/news/${id}`, { method: 'GET' }));

// TODO: Report feature temporarily disabled — to be re-enabled in future release.
// export const reportNews = (newsId, reason) =>
//   unwrap(requestJson(`/news/${newsId}/report`, {
//     method: 'POST',
//     body: JSON.stringify({ reason }),
//   }));

export const getSavedNews = (params = {}) => {
  const searchParams = new URLSearchParams();
  appendEnumParam(searchParams, 'category', params.category);
  appendTextParam(searchParams, 'keyword', params.keyword);
  if (params.dateRange && params.dateRange !== 'ALL') searchParams.set('dateRange', params.dateRange);
  searchParams.set('page', String(params.page ?? 0));
  searchParams.set('size', String(params.size ?? 10));
  return unwrap(requestJson(`/news/saved?${searchParams.toString()}`, { method: 'GET' }));
};

export const saveNews = (newsId) =>
  unwrap(requestJson(`/news/saved/${newsId}`, { method: 'POST' }));

export const unsaveNews = (newsId) =>
  unwrap(requestJson(`/news/saved/${newsId}`, { method: 'DELETE' }));

export const checkSaved = async (newsId) => {
  const data = await unwrap(requestJson(`/news/saved/${newsId}/check`, { method: 'GET' }));
  return Boolean(data);
};

export const getImportantNews = (params = {}) => getNews({
  isImportant: true,
  page: params.page ?? 0,
  size: params.size ?? 5,
  sortBy: params.sortBy ?? 'createdAt',
});

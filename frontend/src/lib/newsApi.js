import { apiFetch, requestJson } from './api';

const unwrap = async (promise) => {
  const response = await promise;
  return response?.data ?? response;
};

export const getNews = (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  if (params.newsType) searchParams.set('newsType', params.newsType);
  if (params.language) searchParams.set('language', params.language);
  if (params.isImportant) searchParams.set('isImportant', 'true');
  if (params.keyword?.trim()) searchParams.set('keyword', params.keyword.trim());
  searchParams.set('page', String(params.page ?? 0));
  searchParams.set('size', String(params.size ?? 10));
  searchParams.set('sortBy', params.sortBy || 'newest');
  return unwrap(requestJson(`/news?${searchParams.toString()}`, { method: 'GET' }));
};

export const getNewsById = (id) =>
  unwrap(requestJson(`/news/${id}`, { method: 'GET' }));

export const getSavedNews = (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  if (params.keyword?.trim()) searchParams.set('keyword', params.keyword.trim());
  searchParams.set('page', String(params.page ?? 0));
  searchParams.set('size', String(params.size ?? 10));
  return unwrap(requestJson(`/news/saved?${searchParams.toString()}`, { method: 'GET' }));
};

export const saveNews = (newsId) =>
  unwrap(requestJson(`/news/saved/${newsId}`, { method: 'POST' }));

export const unsaveNews = (newsId) =>
  unwrap(requestJson(`/news/saved/${newsId}`, { method: 'DELETE' }));

export const checkSaved = async (newsId) => {
  const data = await unwrap(requestJson(`/news/saved/${newsId}/status`, { method: 'GET' }));
  return Boolean(data?.saved);
};

export const trackNewsView = async (newsId) => {
  try {
    await apiFetch(`/news/${newsId}/view`, { method: 'POST' });
  } catch {
    // analytics tracking is best-effort only
  }
};

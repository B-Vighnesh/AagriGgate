import { requestJson } from './api';

const unwrap = async (promise) => {
  const response = await promise;
  return response?.data ?? response;
};

export const getNotifications = ({ status = 'UNREAD', page = 0, size = 10 } = {}) => {
  const searchParams = new URLSearchParams();
  if (status) searchParams.set('status', status);
  searchParams.set('page', String(page));
  searchParams.set('size', String(size));
  return unwrap(requestJson(`/notifications?${searchParams.toString()}`, { method: 'GET' }));
};

export const countUnread = () =>
  unwrap(requestJson('/notifications/count-unread', { method: 'GET' }));

export const markAsRead = (notificationId) =>
  unwrap(requestJson(`/notifications/${notificationId}/read`, { method: 'PATCH' }));

export const markAllAsRead = () =>
  unwrap(requestJson('/notifications/read-all', { method: 'PATCH' }));

export const getPreferences = () =>
  unwrap(requestJson('/notifications/preferences', { method: 'GET' }));

export const setPreference = (type, enabled) =>
  unwrap(requestJson(`/notifications/preferences/${type}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  }));

export const resetPreferences = () =>
  unwrap(requestJson('/notifications/preferences/reset', { method: 'POST' }));

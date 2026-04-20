import { requestJson } from './api';

const unwrap = async (promise) => {
  const response = await promise;
  return response?.data ?? response;
};

export const getNotifications = ({ deliveryType = 'NOTIFICATION', page = 0, size = 10 } = {}) => {
  const searchParams = new URLSearchParams();
  if (deliveryType) searchParams.set('deliveryType', deliveryType);
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

export const setPreference = (categoryName, deliveryType) =>
  unwrap(requestJson(`/notifications/preferences/${categoryName}`, {
    method: 'PATCH',
    body: JSON.stringify({ deliveryType }),
  }));

export const resetPreferences = () =>
  unwrap(requestJson('/notifications/preferences/reset', { method: 'POST' }));

export const setAllPreferencesToNotifications = () =>
  unwrap(requestJson('/notifications/preferences/bulk/all-notifications', { method: 'POST' }));

export const turnAlertsOff = () =>
  unwrap(requestJson('/notifications/preferences/bulk/alerts-off', { method: 'POST' }));

export const turnAllPreferencesOff = () =>
  unwrap(requestJson('/notifications/preferences/bulk/off', { method: 'POST' }));

export const getActiveAlerts = () =>
  unwrap(requestJson('/notifications/alerts/active', { method: 'GET' }));

export const acknowledgeAlert = (notificationId) =>
  unwrap(requestJson(`/notifications/${notificationId}/acknowledge`, { method: 'PATCH' }));

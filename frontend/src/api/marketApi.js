import { apiFetch, requestJson } from '../lib/api';

export const getMarketPrice = async ({ crop, state, district, fromDate, toDate, page = 0, size = 20 }) => {
  const params = new URLSearchParams();
  params.append('crop', crop);
  if (state) params.append('state', state);
  if (district) params.append('district', district);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  params.append('page', String(page));
  params.append('size', String(size));
  return requestJson(`/market?${params.toString()}`);
};

export const getSavedMarketData = async ({ page = 0, size = 100 }) =>
  requestJson(`/saved-market?page=${page}&size=${size}`);

export const saveMarketData = async (body) => {
  return apiFetch('/saved-market', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const deleteSavedMarketData = async (id) => {
  return apiFetch(`/saved-market/${id}`, {
    method: 'DELETE',
  });
};

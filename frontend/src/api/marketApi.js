import { apiFetch, requestJson } from '../lib/api';

export const getMarketPrice = async ({ crop, state, district, arrivalDate }) => {
  const params = new URLSearchParams();
  params.append('crop', crop);
  if (state) params.append('state', state);
  if (district) params.append('district', district);
  if (arrivalDate) params.append('arrivalDate', arrivalDate);
  return requestJson(`/market-price?${params.toString()}`);
};

export const getSavedMarketData = async ({ page = 0, size = 100 }) =>
  requestJson(`/saved-market-data?page=${page}&size=${size}`);

export const saveMarketData = async (body) => {
  return apiFetch('/saved-market-data', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const deleteSavedMarketData = async (id) => {
  return apiFetch(`/saved-market-data/${id}`, {
    method: 'DELETE',
  });
};

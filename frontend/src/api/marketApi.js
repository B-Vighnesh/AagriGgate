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

export const getMarketPriceTrend = async ({ commodity, state, district, fromDate, toDate }) => {
  const params = new URLSearchParams();
  params.append('commodity', commodity);
  params.append('state', state);
  if (district) params.append('district', district);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  return requestJson(`/market/analytics/price-trend?${params.toString()}`);
};

export const getMarketHeatmap = async ({ commodity, state, date }) => {
  const params = new URLSearchParams();
  params.append('commodity', commodity);
  params.append('state', state);
  if (date) params.append('date', date);
  return requestJson(`/market/analytics/heatmap?${params.toString()}`);
};

export const getMarketMinMaxModalTrend = async ({ commodity, state, district, fromDate, toDate }) => {
  const params = new URLSearchParams();
  params.append('commodity', commodity);
  params.append('state', state);
  if (district) params.append('district', district);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  return requestJson(`/market/analytics/min-max-modal-trend?${params.toString()}`);
};

export const getMarketArrivalVsPrice = async ({ commodity, state, district, fromDate, toDate }) => {
  const params = new URLSearchParams();
  params.append('commodity', commodity);
  params.append('state', state);
  if (district) params.append('district', district);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  return requestJson(`/market/analytics/arrival-vs-price?${params.toString()}`);
};

export const getMarketSeasonalTrend = async ({ commodity, state, district, year, fromDate, toDate }) => {
  const params = new URLSearchParams();
  params.append('commodity', commodity);
  params.append('state', state);
  if (district) params.append('district', district);
  if (year) params.append('year', String(year));
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  return requestJson(`/market/analytics/seasonal-trend?${params.toString()}`);
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

export const deleteAllSavedMarketData = async () => {
  return apiFetch('/saved-market', {
    method: 'DELETE',
  });
};

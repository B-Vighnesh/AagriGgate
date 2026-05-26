import { requestJson } from '../lib/api';

const unwrap = async (promise) => {
  const response = await promise;
  return response?.data ?? response;
};

export const getNavbarCounts = () =>
  unwrap(requestJson('/navbar/counts', { method: 'GET' }));

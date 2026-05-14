import { requestJson } from './api';

const unwrap = async (promise) => {
  const response = await promise;
  return response?.data ?? response;
};

export const countRoleBasedRequests = (role) => {
  if (role === 'buyer') {
    return unwrap(requestJson('/buyer/approach/requests/accepted', { method: 'GET' }));
  }

  if (role === 'farmer') {
    return unwrap(requestJson('/seller/approach/requests/pending', { method: 'GET' }));
  }

  return Promise.resolve(0);
};

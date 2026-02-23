import { apiFetch, requestJson } from '../lib/api';

export const addCrop = async (formData) => {
  return apiFetch('/crops/farmer/add', {
    method: 'POST',
    body: formData,
  });
};

export const getFarmerById = async (farmerId) => {
  return requestJson(`/farmers/${farmerId}`);
};

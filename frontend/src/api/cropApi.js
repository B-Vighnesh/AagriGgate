import { apiFetch, requestJson } from '../lib/api';

export const unwrapApiResponse = (payload) => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
};

export const getCropId = (crop) => crop?.cropID ?? crop?.cropId ?? crop?.id;

export const normalizeCrop = (crop) => {
  if (!crop || typeof crop !== 'object') return crop;
  const cropID = getCropId(crop);
  return {
    ...crop,
    cropID,
    cropId: cropID,
    isUrgent: Boolean(crop.isUrgent ?? crop.urgent),
    isWaste: Boolean(crop.isWaste ?? crop.waste),
    state: crop.state || '',
    district: crop.district || '',
    thumbnailUrl: crop.thumbnailUrl || (cropID ? `/crops/legacy/${cropID}/thumbnail` : ''),
    imageUrl: crop.imageUrl || (cropID ? `/crops/legacy/${cropID}/image` : ''),
  };
};

export const normalizeCropPage = (payload) => {
  const page = unwrapApiResponse(payload) || {};
  return {
    ...page,
    content: Array.isArray(page.content) ? page.content.map(normalizeCrop) : [],
  };
};

export const normalizeCropResponse = (payload) => normalizeCrop(unwrapApiResponse(payload));

export const addCrop = async (formData) => {
  return apiFetch('/crops/farmer/add', {
    method: 'POST',
    body: formData,
  });
};

export const updateCrop = async (cropId, formData) => {
  return apiFetch(`/crops/farmer/${cropId}`, {
    method: 'PUT',
    body: formData,
  });
};

export const getCropImageBlob = async (cropId, variant = 'image') => {
  const response = await apiFetch(`/crops/legacy/${cropId}/${variant}`, { method: 'GET' });
  if (!response.ok) return null;
  return response.blob();
};

export const getFarmerById = async (farmerId) => {
  return requestJson('/farmers/me');
};

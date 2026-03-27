import { requestJson } from '../lib/api';

export const getFavoriteStatus = (cropId) => requestJson(`/crops/${cropId}/favorite`, { method: 'GET' });

export const addFavorite = (cropId) => requestJson(`/crops/${cropId}/favorite`, { method: 'POST' });

export const removeFavorite = (cropId) => requestJson(`/crops/${cropId}/favorite`, { method: 'DELETE' });

export const getFavorites = ({ page = 0, size = 10, keyword = '', type = 'all', sortBy = 'newest' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    type,
  });
  if (keyword.trim()) params.set('keyword', keyword.trim());
  return requestJson(`/users/favorites?${params.toString()}`, { method: 'GET' });
};

export const getCart = ({ page = 0, size = 10, keyword = '', type = 'all', sortBy = 'newest' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    type,
  });
  if (keyword.trim()) params.set('keyword', keyword.trim());
  return requestJson(`/cart?${params.toString()}`, { method: 'GET' });
};

export const addToCart = ({ cropId, quantity }) =>
  requestJson('/cart', {
    method: 'POST',
    body: JSON.stringify({ cropId, quantity }),
  });

export const updateCartItem = ({ cartId, quantity }) =>
  requestJson(`/cart/${cartId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (cartId) =>
  requestJson(`/cart/${cartId}`, { method: 'DELETE' });

export const checkoutCart = () =>
  requestJson('/cart/checkout', { method: 'POST' });

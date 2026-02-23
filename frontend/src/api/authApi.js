import { requestJson } from '../lib/api';

export const validateToken = async () => {
  return requestJson('/auth/isTokenValid');
};

export const sendResetOtp = async (principal) => {
  return requestJson(`/auth/reset-otp/${encodeURIComponent(principal)}`, { method: 'POST' });
};

export const verifyOtp = async (email, otp) => {
  const params = new URLSearchParams({ email, otp });
  return requestJson(`/auth/verify-otp?${params.toString()}`, { method: 'POST' });
};

import { requestJson } from '../lib/api';

export const login = async (principal, password) =>
  requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ principal, password }),
  });

export const sendLoginOtp = async (principal) =>
  requestJson('/auth/login/send-otp', {
    method: 'POST',
    body: JSON.stringify({ principal }),
  });

export const loginWithOtp = async (principal, otp) =>
  requestJson('/auth/login/otp', {
    method: 'POST',
    body: JSON.stringify({ principal, otp }),
  });

export const registerSeller = async (payload) =>
  requestJson('/auth/register/seller', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const registerBuyer = async (payload) =>
  requestJson('/auth/register/buyer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const sendForgotPasswordOtp = async (email) =>
  requestJson('/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const verifyForgotPasswordOtp = async (email, otp) =>
  requestJson('/password/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const resetPassword = async (email, newPassword) =>
  requestJson('/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });

export const changePassword = async (currentPassword, newPassword) =>
  requestJson('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const deleteAccount = async (currentPassword) =>
  requestJson('/auth/delete-account', {
    method: 'DELETE',
    body: JSON.stringify({ currentPassword }),
  });

// export const deactivateAccount = async (currentPassword) =>
//   requestJson('/auth/deactivate-account', {
//     method: 'POST',
//     body: JSON.stringify({ currentPassword }),
//   });

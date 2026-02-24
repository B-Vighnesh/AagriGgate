import { requestJson } from '../lib/api';

export const login = async (principal, password) =>
  requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ principal, password }),
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

export const resetPassword = async (email, newPassword) =>
  requestJson('/auth/reset-password', {
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

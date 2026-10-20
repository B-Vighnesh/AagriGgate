import { login } from '../api/authApi';
import { setAuth } from './auth';

const GUEST_PASSWORDS = {
  farmer: import.meta.env.VITE_GUEST_FARMER_PASSWORD || 'Farmer@1234',
  buyer: import.meta.env.VITE_GUEST_BUYER_PASSWORD || 'Buyer@1234',
};

export const isGuestPasswordConfigured = (role) => Boolean(GUEST_PASSWORDS[role]);

function normalizeRole(role) {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'SELLER' || normalized === 'FARMER') return 'farmer';
  if (normalized === 'BUYER') return 'buyer';
  return String(role || '').toLowerCase();
}

export async function loginAsGuest(role) {
  const guestRole = role === 'farmer' ? 'farmer' : 'buyer';
  const password = GUEST_PASSWORDS[guestRole];
  if (!password) {
    throw new Error(`Guest ${guestRole} login is not configured in the frontend environment.`);
  }

  const principal = guestRole === 'farmer' ? 'guestfarmer' : 'guestbuyer';
  const response = await login(principal, password);
  const session = setAuth({ ...response, role: normalizeRole(response?.role) || guestRole });

  if (!session) {
    throw new Error('The guest account returned an incomplete login session.');
  }

  return session;
}

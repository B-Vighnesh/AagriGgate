export function normalizeRequestStatus(status) {
  const key = String(status || 'pending').trim().toLowerCase();
  if (key === 'rejected') return 'failed';
  if (['pending', 'accepted', 'completed', 'failed', 'expired'].includes(key)) return key;
  return 'pending';
}

export function getRequestStatusLabel(status) {
  return normalizeRequestStatus(status).toUpperCase();
}

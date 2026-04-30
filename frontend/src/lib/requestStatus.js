export function normalizeRequestLifecycleStatus(status) {
  const key = String(status || 'pending').toLowerCase();
  if (key === 'accepted') return 'active';
  if (key === 'rejected') return 'failed';
  if (['pending', 'active', 'completed', 'failed', 'expired'].includes(key)) return key;
  return 'pending';
}

export function getRequestLifecycleStatusLabel(status) {
  return normalizeRequestLifecycleStatus(status).toUpperCase();
}

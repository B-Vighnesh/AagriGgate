export function resolveNotificationRoute(notification, role) {
  const referenceId = notification?.referenceId;
  if (notification?.referenceType === 'CROP' && referenceId) return `/view-details/${referenceId}`;
  if (notification?.referenceType === 'NEWS' && referenceId) return `/news/${referenceId}`;
  if (notification?.referenceType === 'REQUEST') {
    return referenceId ? `/requests/${referenceId}` : (role === 'farmer' ? '/view-approach' : '/view-approaches-user');
  }
  if (notification?.referenceType === 'MARKET' && referenceId) return `/market/${referenceId}`;
  if (notification?.referenceType === 'CHAT' && referenceId) return `/chat/${referenceId}`;
  if (notification?.referenceType === 'WEATHER') return '/weather';
  if (notification?.referenceType === 'ADMIN') return '/account';
  if (notification?.referenceType === 'USER') return '/account';
  return null;
}

export function sortNotificationsByDate(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left?.createdAt || 0).getTime();
    const rightTime = new Date(right?.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
}

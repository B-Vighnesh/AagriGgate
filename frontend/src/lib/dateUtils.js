export function formatNewsDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns a date group label for sorting news into visual sections.
 * Groups: "Today", "Yesterday", or a formatted date string (e.g. "March 28").
 */
export function getDateGroupLabel(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  if (date >= todayStart) return 'Today';
  if (date >= yesterdayStart) return 'Yesterday';

  // For older dates, show "Month Day" (e.g. "March 28")
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

/**
 * Groups an array of news items by date label.
 * Returns an array of { label, items } objects in chronological order (newest first).
 */
export function groupNewsByDate(items) {
  if (!items || items.length === 0) return [];

  const groups = new Map();
  for (const item of items) {
    const label = getDateGroupLabel(item.publishedAt || item.createdAt);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(item);
  }

  // Convert to array — Map preserves insertion order which mirrors the server sort
  return Array.from(groups.entries()).map(([label, groupItems]) => ({
    label,
    items: groupItems,
  }));
}

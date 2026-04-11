/**
 * Formats a timestamp into a human-readable "Last seen" string.
 * @param {Date|string} date - The lastSeen timestamp from the DB.
 * @returns {string} 
 */
export const formatLastSeen = (date) => {
  if (!date) return "Long ago";
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "online_grace";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Date(date).toLocaleDateString();
};
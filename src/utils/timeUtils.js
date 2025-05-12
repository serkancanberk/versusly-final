export function getRemainingTimeMessage(expiresAt) {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires - now;
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (diffMins < 1) return "Less than a minute left!";
  if (diffMins < 60) return `${diffMins}m left`;
  const hours = Math.floor(diffMins / 60);
  return `${hours}h left`;
} 
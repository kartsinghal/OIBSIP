/**
 * Generates a unique, human-readable public order ID.
 * Format: INF-{YEAR}-{6 alphanumeric chars}
 * Example: INF-2026-A7K9P2
 */
export const generatePublicOrderId = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (I, O, 0, 1)
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `INF-${year}-${suffix}`;
};

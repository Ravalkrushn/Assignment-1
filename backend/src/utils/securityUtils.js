/**
 * Security Utilities
 * Protects MongoDB query operations against ReDoS, injection, and malicious payloads.
 */

/**
 * Safely escapes user-supplied string for safe inclusion in RegExp queries.
 * Enforces length cap to prevent computational denial of service.
 * 
 * @param {string} str - Raw user input
 * @param {number} maxLength - Maximum allowable query length (default: 100)
 * @returns {string} Sanitized string with regex metacharacters escaped
 */
export const escapeRegex = (str, maxLength = 100) => {
  if (typeof str !== 'string') return '';
  const trimmed = str.trim().slice(0, maxLength);
  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

import crypto from 'crypto';
import { env } from '../config/env.js';

export const cryptoUtils = {
  /**
   * Generates a cryptographically strong, human-readable scratch code
   * Format: BOX-[4 Alphanumeric]-[4 Alphanumeric] (e.g. BOX-8F92-K7L3)
   */
  generateProductCode: (prefix = 'BOX') => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Base32 without ambiguous 0/O, 1/I
    let part1 = '';
    let part2 = '';
    
    const randomBytes = crypto.randomBytes(8);
    for (let i = 0; i < 4; i++) {
      part1 += chars[randomBytes[i] % chars.length];
      part2 += chars[randomBytes[i + 4] % chars.length];
    }
    
    return `${prefix.toUpperCase()}-${part1}-${part2}`;
  },

  /**
   * Generates HMAC-SHA256 hash using the secret key
   * Ensures plaintext codes cannot be derived if database is leaked
   */
  hashProductCode: (code) => {
    if (!code) return '';
    const normalized = code.trim().toUpperCase();
    return crypto
      .createHmac('sha256', env.CODE_HASH_SECRET)
      .update(normalized)
      .digest('hex');
  },

  /**
   * Generates a cryptographically secure random token (e.g. for password resets)
   */
  generateRandomToken: (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
  },

  /**
   * Hashes a token using SHA-256 for secure DB lookup
   */
  hashToken: (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
};

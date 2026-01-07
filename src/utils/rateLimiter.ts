/** Rate limiting utility */
import { config } from '../config/settings';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<number, RateLimitEntry>();

export function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create entry
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + 60000, // 1 minute
    });
    return true;
  }
  
  if (entry.count >= config.rateLimit.perMinute) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(userId);
    }
  }
}, 60000); // Every minute


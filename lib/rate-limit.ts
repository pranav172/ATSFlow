/**
 * Simple in-memory rate limiter for API routes
 * 
 * For production, use Redis-based rate limiting (e.g., @upstash/ratelimit)
 * This is a lightweight solution for MVP/development
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  keyPrefix?: string;   // Optional prefix for the key
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;      // Seconds until reset
  limit: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (usually userId or IP)
 * @param config - Rate limit configuration
 * @returns Result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = config.keyPrefix 
    ? `${config.keyPrefix}:${identifier}` 
    : identifier;
  
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // If no entry or entry expired, create new one
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
      limit: config.maxRequests,
    };
  }
  
  // Entry exists and is valid
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
      limit: config.maxRequests,
    };
  }
  
  // Increment and allow
  entry.count++;
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    limit: config.maxRequests,
  };
}

// Pre-configured rate limiters for different use cases
export const RATE_LIMITS = {
  // Upload: 10 uploads per hour
  upload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'upload',
  },
  
  // Analysis: 20 analyses per hour
  analyze: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    keyPrefix: 'analyze',
  },
  
  // JD Matching: 30 per hour
  match: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 30,
    keyPrefix: 'match',
  },
  
  // General API: 100 requests per minute
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'api',
  },
  
  // AI operations (expensive): 50 per hour
  ai: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 50,
    keyPrefix: 'ai',
  },
} as const;

/**
 * Helper to create rate limit headers for responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn.toString(),
  };
}

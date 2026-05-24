// Simple in-memory rate limiter for API routes
// For production, use Redis or Upstash

const rateLimitMap = new Map()

export function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // max requests per window
    keyGenerator = (req) => req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  } = options

  return function rateLimitMiddleware(req, res, next) {
    const key = keyGenerator(req)
    const now = Date.now()
    const windowStart = now - windowMs

    // Get or create entry for this IP
    let entry = rateLimitMap.get(key)

    if (!entry || entry.timestamp < windowStart) {
      // New window, reset
      entry = { timestamp: now, count: 1 }
    } else {
      // Increment count in current window
      entry.count++

      if (entry.count > max) {
        return {
          limited: true,
          message: 'Terlalu banyak permintaan. Coba lagi nanti.',
          retryAfter: Math.ceil((entry.timestamp + windowMs - now) / 1000)
        }
      }
    }

    rateLimitMap.set(key, entry)

    // Cleanup old entries (every 100 requests)
    if (Math.random() < 0.01) {
      cleanupOldEntries(windowStart)
    }

    return { limited: false }
  }
}

function cleanupOldEntries(threshold) {
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.timestamp < threshold) {
      rateLimitMap.delete(key)
    }
  }
}

// Helper to check rate limit in API routes
export function checkRateLimit(req, options = {}) {
  const result = rateLimit(options)(req, {}, null)
  if (result.limited) {
    return {
      allowed: false,
      message: result.message,
      retryAfter: result.retryAfter
    }
  }
  return { allowed: true }
}
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const response = NextResponse.next()

  // Security headers
  const headers = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // XSS protection
    'X-XSS-Protection': '1; mode=block',
    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Content Security Policy
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://static.cloudflareinsights.com; frame-src 'none'",
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/flush-cache).*)',
  ],
}
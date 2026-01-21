import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ratelimit, authRatelimit } from '@/lib/ratelimit';

// Rate limiting middleware for API routes
async function rateLimitMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Apply rate limiting to API routes
  if (path.startsWith('/api')) {
    // Get IP address from headers or connection
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
    
    // Use stricter rate limit for auth endpoints
    const limiter = path.startsWith('/api/auth') ? authRatelimit : ratelimit;
    
    try {
      const { success, limit, reset, remaining } = await limiter.limit(ip);
      
      if (!success) {
        return NextResponse.json(
          { 
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            }
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
      
      return response;
    } catch (error) {
      // If rate limiting fails (e.g., Redis is down), allow the request but log the error
      console.error('Rate limiting error:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Auth middleware for protected routes
const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based access control
    // Allow ADMIN, SUPER_ADMIN, CLERK, and TEACHER to access admin routes
    if (path.startsWith('/admin') && 
        token?.role !== 'ADMIN' && 
        token?.role !== 'SUPER_ADMIN' &&
        token?.role !== 'CLERK' &&
        token?.role !== 'TEACHER') {
      return Response.redirect(new URL('/dashboard', req.url));
    }

    if (path.startsWith('/dashboard') && token?.role !== 'STUDENT') {
      return Response.redirect(new URL('/admin/dashboard', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Combined middleware
export default async function middleware(req: NextRequest) {
  // Apply rate limiting first
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }

  // Then apply auth middleware for protected routes
  const path = req.nextUrl.pathname;
  if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/applications')) {
    return authMiddleware(req as any);
  }

  return rateLimitResponse;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/applications/:path*'
  ],
};

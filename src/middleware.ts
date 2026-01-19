import { withAuth } from 'next-auth/middleware';

export default withAuth(
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

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/applications/:path*'],
};

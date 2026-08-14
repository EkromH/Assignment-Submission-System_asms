import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Retrieve token from cookies
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // Protected paths for all roles
  const isProtectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student');

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Disable caching for protected pages at the HTTP level
  if (isProtectedPath) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
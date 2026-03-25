import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hasToken = request.cookies.has('ws_session');
    const hasAdminToken = request.cookies.has('ws_admin_session');
    const path = request.nextUrl.pathname;

    // ── Donor Auth Protection ──
    const isDonorAuthPath = [
        '/donor/login',
        '/donor/register',
        '/welcome',
        '/donor/intro',
        '/'
    ].includes(path);

    if (hasToken && isDonorAuthPath) {
        return NextResponse.redirect(new URL('/donor/dashboard', request.url));
    }

    // ── Admin Protection ──
    if (path.startsWith('/admin') && path !== '/admin/login') {
        if (!hasAdminToken) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // If an admin is logged in and visits /admin/login, send them to dashboard
    if (path === '/admin/login' && hasAdminToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/welcome',
        '/donor/intro',
        '/donor/login',
        '/donor/register',
        '/admin/:path*'
    ],
};

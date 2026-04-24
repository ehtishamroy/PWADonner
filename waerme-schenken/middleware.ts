import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hasToken = request.cookies.has('ws_session');
    const hasAdminToken = request.cookies.has('ws_admin_session');
    const path = request.nextUrl.pathname;

    // ── Shared Auth Paths (donor OR family will be redirected from here) ──
    const isSharedAuthPath = ['/welcome', '/'].includes(path);

    const isDonorAuthPath = [
        '/donor/login',
        '/donor/register',
        '/donor/intro',
    ].includes(path);

    const isFamilyAuthPath = [
        '/family/login',
        '/family/register',
        '/family/intro',
    ].includes(path);

    // Logged-in users hitting auth pages → redirect (role determined client-side, default to donor)
    if (hasToken && (isSharedAuthPath || isDonorAuthPath || isFamilyAuthPath)) {
        // Can't tell role from cookie alone; donor dashboard does its own role check
        return NextResponse.redirect(new URL('/donor/dashboard', request.url));
    }

    // ── Admin Protection ──
    if (path.startsWith('/admin') && path !== '/admin/login') {
        if (!hasAdminToken) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

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
        '/family/intro',
        '/family/login',
        '/family/register',
        '/admin/:path*',
    ],
};

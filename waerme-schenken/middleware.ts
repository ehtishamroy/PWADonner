import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'dev-secret-change-in-production-32chars!!'
);

async function getRoleFromToken(request: NextRequest): Promise<string | null> {
    const token = request.cookies.get('ws_session')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return (payload.role as string) || null;
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
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

    // Logged-in users hitting auth pages → redirect to their correct dashboard by role
    if (hasToken && (isSharedAuthPath || isDonorAuthPath || isFamilyAuthPath)) {
        const role = await getRoleFromToken(request);
        const dest = role === 'family' ? '/family/dashboard' : '/donor/dashboard';
        return NextResponse.redirect(new URL(dest, request.url));
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

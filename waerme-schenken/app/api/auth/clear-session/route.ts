import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const url = new URL(request.url);
    let callbackUrl = url.searchParams.get('callbackUrl') || '/donor/login';

    if (!callbackUrl.startsWith('/') || callbackUrl.startsWith('//')) {
        callbackUrl = '/donor/login';
    }

    const cookieStore = await cookies();
    cookieStore.delete('ws_session');

    const redirectUrl = new URL(callbackUrl, request.url);
    redirectUrl.searchParams.set('cleared', Date.now().toString());

    return NextResponse.redirect(redirectUrl.toString(), {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
}

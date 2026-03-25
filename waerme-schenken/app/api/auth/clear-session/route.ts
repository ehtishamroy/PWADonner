import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const callbackUrl = url.searchParams.get('callbackUrl') || '/donor/login';

    const cookieStore = await cookies();
    cookieStore.delete('ws_session');

    // Make sure we resolve to an absolute URL, append a random cache-buster
    const redirectUrl = new URL(callbackUrl, request.url);
    redirectUrl.searchParams.set('cleared', Date.now().toString());
    const finalUrl = redirectUrl.toString();
    
    // Return HTML to force browser to stop caching 307 redirects
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="refresh" content="0;url=${finalUrl}">
                <title>Laden...</title>
            </head>
            <body>
                <script>
                    // Fallback JS redirect
                    window.location.href = "${finalUrl}";
                </script>
            </body>
        </html>
    `;

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-side proxy for Swiss ZIP/city autocomplete via OpenPLZ API.
 * Avoids CORS restrictions when browsers (esp. via service worker) try
 * to call openplzapi.org directly.
 *
 * GET /api/swiss-post?q=8001
 * Returns: { suggestions: [{ zip, city }, ...] }
 */
export async function GET(req: NextRequest) {
    const q = (req.nextUrl.searchParams.get('q') || '').trim();
    if (q.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    const upstream = `https://openplzapi.org/ch/Localities?postalCode=${encodeURIComponent('^' + q)}&pageSize=8`;

    try {
        const res = await fetch(upstream, {
            headers: { 'User-Agent': 'waerme-schenken-app' },
            cache: 'no-store',
        });
        if (!res.ok) {
            return NextResponse.json({ suggestions: [] }, { status: 200 });
        }
        const data = await res.json();
        const suggestions = (Array.isArray(data) ? data : [])
            .map((r: { postalCode?: string; name?: string }) => ({
                zip: r.postalCode ?? '',
                city: r.name ?? '',
            }))
            .filter((s: { zip: string; city: string }) => s.zip && s.city);

        return NextResponse.json({ suggestions });
    } catch (err) {
        console.error('swiss-post proxy error', err);
        return NextResponse.json({ suggestions: [] }, { status: 200 });
    }
}

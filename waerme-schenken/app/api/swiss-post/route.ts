import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-side proxy for Swiss Post ZIP/city autocomplete.
 * Avoids CORS restrictions when browsers (esp. via service worker) try
 * to call swisspost.opendatasoft.com directly.
 *
 * GET /api/swiss-post?q=8001
 * Returns: { suggestions: [{ zip, city }, ...] }
 */
export async function GET(req: NextRequest) {
    const q = (req.nextUrl.searchParams.get('q') || '').trim();
    if (q.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    const upstream = `https://swisspost.opendatasoft.com/api/records/1.0/search/?dataset=plz_verzeichnis_v2&q=${encodeURIComponent(q)}&rows=8&facet=postleitzahl&facet=ortbez27`;

    try {
        const res = await fetch(upstream, {
            headers: { 'User-Agent': 'waerme-schenken-app' },
            cache: 'no-store',
        });
        if (!res.ok) {
            return NextResponse.json({ suggestions: [] }, { status: 200 });
        }
        const data = await res.json();
        const suggestions = (data.records || [])
            .map((r: { fields?: { postleitzahl?: string | number; ortbez27?: string } }) => ({
                zip: String(r.fields?.postleitzahl ?? ''),
                city: r.fields?.ortbez27 ?? '',
            }))
            .filter((s: { zip: string; city: string }) => s.zip && s.city);

        return NextResponse.json({ suggestions });
    } catch (err) {
        console.error('swiss-post proxy error', err);
        return NextResponse.json({ suggestions: [] }, { status: 200 });
    }
}

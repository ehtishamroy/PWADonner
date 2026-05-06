import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-side proxy for Swiss street autocomplete via OpenPLZ API.
 *
 * GET /api/swiss-streets?q=Bahnhof&zip=8001
 * Returns: { suggestions: [{ street }, ...] }
 */
export async function GET(req: NextRequest) {
    const q   = (req.nextUrl.searchParams.get('q')   || '').trim();
    const zip = (req.nextUrl.searchParams.get('zip') || '').trim();

    if (q.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    const params = new URLSearchParams({
        name:     '^' + q,
        pageSize: '8',
    });
    if (zip.length >= 4) params.set('postalCode', '^' + zip);

    const upstream = `https://openplzapi.org/ch/Streets?${params.toString()}`;

    try {
        const res = await fetch(upstream, {
            headers: { 'User-Agent': 'waerme-schenken-app' },
            cache: 'no-store',
        });
        if (!res.ok) {
            return NextResponse.json({ suggestions: [] }, { status: 200 });
        }
        const data = await res.json();
        const seen = new Set<string>();
        const suggestions = (Array.isArray(data) ? data : [])
            .map((r: { name?: string }) => ({ street: r.name ?? '' }))
            .filter((s: { street: string }) => {
                if (!s.street || seen.has(s.street)) return false;
                seen.add(s.street);
                return true;
            });

        return NextResponse.json({ suggestions });
    } catch (err) {
        console.error('swiss-streets proxy error', err);
        return NextResponse.json({ suggestions: [] }, { status: 200 });
    }
}

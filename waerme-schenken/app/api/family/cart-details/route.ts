import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// POST /api/family/cart-details { ids: string[] }
// Returns just enough per-item detail for the cart to render and detect stale
// items. It deliberately does NOT expose which family reserved or selected an
// item — only booleans computed server-side — so a family cannot learn who
// reserved/selected which toy by posting arbitrary IDs.
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (!user || user.role !== 'family') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ items: [] });
    }

    const rows = await db.donation.findMany({
        where: { id: { in: ids } },
        select: {
            id: true, toyName: true, category: true, condition: true,
            ageRange: true, status: true, reservedUntil: true,
            reservedByFamilyId: true,
            images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { imageUrl: true } },
        },
    });

    const now = Date.now();
    const items = rows.map(r => {
        const active = !!r.reservedUntil && new Date(r.reservedUntil).getTime() > now;
        const reservedByMe = active && r.reservedByFamilyId === session.userId;
        const reservedByOther = active && r.reservedByFamilyId !== session.userId;
        return {
            id: r.id,
            toyName: r.toyName,
            category: r.category,
            condition: r.condition,
            ageRange: r.ageRange,
            status: r.status,
            images: r.images,
            reservedByMe,
            reservedByOther,
            // Only expose the countdown for the family's own reservation.
            reservedUntil: reservedByMe ? r.reservedUntil : null,
        };
    });

    return NextResponse.json({ items });
}

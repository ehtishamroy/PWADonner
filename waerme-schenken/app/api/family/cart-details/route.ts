import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// POST /api/family/cart-details { ids: string[] }
// Returns donation details + current status so the cart can detect stale items.
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ items: [] });
    }

    const items = await db.donation.findMany({
        where:   { id: { in: ids } },
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    });

    return NextResponse.json({ items });
}

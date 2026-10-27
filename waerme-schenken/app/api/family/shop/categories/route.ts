import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getShopStatus, SHOP_CLOSED_MESSAGE } from '@/lib/shop-status';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Closed for every family (incl. special) outside the opening window.
    if (!(await getShopStatus()).isOpen) {
        return NextResponse.json({ error: SHOP_CLOSED_MESSAGE, code: 'SHOP_CLOSED' }, { status: 403 });
    }

    const url = new URL(req.url);
    const age = url.searchParams.get('age') || undefined;

    const counts = await db.donation.groupBy({
        by:     ['category'],
        where:  { 
            status: 'approved', 
            ...(age ? { ageRange: age } : {}),
            OR: [
                { reservedUntil: null },
                { reservedUntil: { lt: new Date() } },
                { reservedByFamilyId: session.userId }
            ]
        },
        _count: true,
    });

    return NextResponse.json({ counts });
}

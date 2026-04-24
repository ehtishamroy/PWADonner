import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/family/shop?category=X&ageRange=Y&limit=&skip=
// Returns approved donations for browsing family shop.
export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== 'family') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const ageRange = searchParams.get('ageRange') || undefined;
    const limit    = Math.min(parseInt(searchParams.get('limit') || '24', 10), 48);
    const skip     = parseInt(searchParams.get('skip')  || '0',  10);

    const where: {
        status: 'approved';
        category?: string;
        ageRange?: string;
    } = { status: 'approved' };
    if (category) where.category = category;
    if (ageRange) where.ageRange = ageRange;

    const [items, total] = await Promise.all([
        db.donation.findMany({
            where,
            include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        }),
        db.donation.count({ where }),
    ]);

    return NextResponse.json({ items, total });
}

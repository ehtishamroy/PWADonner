import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const age = url.searchParams.get('age') || undefined;

    const counts = await db.donation.groupBy({
        by:     ['category'],
        where:  { status: 'approved', ...(age ? { ageRange: age } : {}) },
        _count: true,
    });

    return NextResponse.json({ counts });
}

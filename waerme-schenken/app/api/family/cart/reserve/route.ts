import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== 'family') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const reservedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
        
        const result = await db.donation.updateMany({
            where: { 
                id, 
                status: 'approved',
                OR: [
                    { reservedUntil: null },
                    { reservedUntil: { lt: new Date() } },
                    { reservedByFamilyId: user.id }
                ]
            },
            data: { 
                reservedByFamilyId: user.id, 
                reservedUntil 
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Already reserved or unavailable' }, { status: 409 });
        }

        return NextResponse.json({ ok: true, reservedUntil });
    } catch (e) {
        console.error('Reserve error', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

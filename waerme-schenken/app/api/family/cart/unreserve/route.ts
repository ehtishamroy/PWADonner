import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await db.donation.updateMany({
            where: { 
                id, 
                reservedByFamilyId: session.userId 
            },
            data: { 
                reservedByFamilyId: null, 
                reservedUntil: null 
            },
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

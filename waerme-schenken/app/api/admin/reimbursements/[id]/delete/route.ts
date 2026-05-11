import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const c = await cookies();
    if (c.get('ws_admin_session')?.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        await db.shippingReimbursement.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });
        console.error('delete reimbursement error', err);
        return NextResponse.json({ error: 'Fehler beim Löschen.' }, { status: 500 });
    }
}

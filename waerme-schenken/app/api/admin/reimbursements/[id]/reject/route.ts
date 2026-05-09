import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const c = await cookies();
    if (c.get('ws_admin_session')?.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const reimbursement = await db.shippingReimbursement.update({
            where: { id },
            data: { status: 'rejected' }
        });
        return NextResponse.json({ reimbursement });
    } catch (err) {
        console.error('reject error', err);
        return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
    }
}

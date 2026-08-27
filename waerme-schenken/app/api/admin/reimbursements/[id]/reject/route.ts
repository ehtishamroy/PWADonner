import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await requireAdmin();
    if (authError) return authError;

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

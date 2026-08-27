import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        const reimbursements = await db.shippingReimbursement.findMany({
            include: {
                donor: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
                donation: { select: { toyName: true } },
                images: { orderBy: { sortOrder: 'asc' } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reimbursements });
    } catch (err) {
        console.error('admin reimbursements get error', err);
        return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
    }
}

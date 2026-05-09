import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    const c = await cookies();
    if (c.get('ws_admin_session')?.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

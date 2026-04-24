import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { zipCode: true, street: true, city: true, role: true }
        });
        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        
        // Update user (zipCode, and optionally full address for family)
        const data: { zipCode?: string; street?: string; city?: string } = {};
        if (typeof body.zipCode === 'string') data.zipCode = body.zipCode;
        if (typeof body.street  === 'string') data.street  = body.street;
        if (typeof body.city    === 'string') data.city    = body.city;

        await db.user.update({
            where: { id: session.userId },
            data,
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function DELETE() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // If family: release any selected-but-not-yet-sent donations back to the shop.
        await db.donation.updateMany({
            where: {
                selectedByFamilyId: session.userId,
                status: 'selected',
            },
            data: {
                status: 'approved',
                selectedByFamilyId: null,
                selectedAt: null,
            },
        });

        // If donor: delete their donations + images.
        const donations = await db.donation.findMany({
            where:  { donorId: session.userId },
            select: { id: true },
        });
        for (const d of donations) {
            await db.donationImage.deleteMany({ where: { donationId: d.id } });
        }
        await db.donation.deleteMany({ where: { donorId: session.userId } });
        await db.session.deleteMany({ where: { userId: session.userId } });
        await db.user.delete({ where: { id: session.userId } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

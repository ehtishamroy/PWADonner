import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { zipCode: true }
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
        
        // Update user
        await db.user.update({
            where: { id: session.userId },
            data: { zipCode: body.zipCode },
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
        // Delete in order: images → donations → sessions → user
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

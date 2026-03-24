import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const donation = await db.donation.findUnique({
        where:   { id },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!donation || donation.donorId !== session.userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(donation);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const donation = await db.donation.findUnique({ where: { id } });
    if (!donation || donation.donorId !== session.userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.status)         updateData.status         = body.status;
    if (body.trackingNumber) updateData.trackingNumber = body.trackingNumber;
    if (body.status === 'sent') updateData.sentAt      = new Date();

    const updated = await db.donation.update({
        where: { id },
        data:  updateData,
    });
    return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const donation = await db.donation.findUnique({ where: { id } });
    if (!donation || donation.donorId !== session.userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Only allow delete if not sent
    if (donation.status === 'sent') {
        return NextResponse.json({ error: 'Gesendete Spenden können nicht gelöscht werden.' }, { status: 403 });
    }

    await db.donation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}

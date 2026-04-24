import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendDonationSentEmail, sendToyDeletedEmail } from '@/lib/email';

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

    // Email #9: notify family when marked as sent
    if (body.status === 'sent' && donation.selectedByFamilyId) {
        const family = await db.user.findUnique({ where: { id: donation.selectedByFamilyId } });
        if (family) {
            sendDonationSentEmail(
                family.email,
                family.firstName,
                donation.toyName,
                body.trackingNumber || null,
            ).catch(console.error);
        }
    }

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

    // Email #8: notify family if the selected toy is being removed
    if (donation.status === 'selected' && donation.selectedByFamilyId) {
        const family = await db.user.findUnique({ where: { id: donation.selectedByFamilyId } });
        if (family) {
            sendToyDeletedEmail(family.email, family.firstName, donation.toyName).catch(console.error);
        }
    }

    await db.donation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}

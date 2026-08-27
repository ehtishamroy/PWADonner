import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/storage';
import { sendDonationSentEmail, sendToyDeletedEmail, sendDonorDonationSentConfirmationEmail } from '@/lib/email';


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

    if (body.status) {
        if (body.status !== 'sent' || donation.status !== 'selected') {
            return NextResponse.json({ error: 'Ungültiger Status.' }, { status: 400 });
        }
        updateData.status = body.status;
        updateData.sentAt = new Date();
    }
    if (body.trackingNumber) updateData.trackingNumber = body.trackingNumber;

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

    // Email #10: confirm to the donor that donation was marked as sent
    if (body.status === 'sent') {
        const donor = await db.user.findUnique({ where: { id: session.userId } });
        if (donor) {
            sendDonorDonationSentConfirmationEmail(
                donor.email,
                donor.firstName,
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

    const donation = await db.donation.findUnique({ 
        where: { id },
        include: { images: true, reimbursement: { include: { images: true } } }
    });
    
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

    // Delete donation images from disk
    for (const img of donation.images) {
        await deleteFile(img.imageUrl);
    }
    
    // Delete reimbursement images from disk
    if (donation.reimbursement) {
        for (const img of donation.reimbursement.images) {
            await deleteFile(img.imageUrl);
        }
    }

    await db.donation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/storage';
import { sendToyDeletedEmail, sendAccountDeletedEmail } from '@/lib/email';

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
        const data: { zipCode?: string; street?: string; city?: string; emailShareConsent?: boolean } = {};
        if (typeof body.zipCode === 'string') data.zipCode = body.zipCode;
        if (typeof body.street  === 'string') data.street  = body.street;
        if (typeof body.city    === 'string') data.city    = body.city;
        if (typeof body.emailShareConsent === 'boolean') data.emailShareConsent = body.emailShareConsent;

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
        const user = await db.user.findUnique({ where: { id: session.userId } });

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

        // If donor: process their donations before deletion
        const donations = await db.donation.findMany({
            where:  { donorId: session.userId },
            include: { images: true, reimbursement: { include: { images: true } } },
        });

        for (const d of donations) {
            // Email #8: notify family if the selected toy is being removed
            if (d.status === 'selected' && d.selectedByFamilyId) {
                const family = await db.user.findUnique({ where: { id: d.selectedByFamilyId } });
                if (family) {
                    sendToyDeletedEmail(family.email, family.firstName, d.toyName).catch(console.error);
                }
            }
            
            // Delete donation images from disk
            for (const img of d.images) {
                await deleteFile(img.imageUrl);
            }
            
            // Delete reimbursement images from disk
            if (d.reimbursement) {
                for (const img of d.reimbursement.images) {
                    await deleteFile(img.imageUrl);
                }
            }
        }

        // Delete social card from disk if exists
        if (user?.socialCardUrl) {
            await deleteFile(user.socialCardUrl);
        }

        // Delete user (Prisma cascade handles deleting donations, images, sessions, etc.)
        await db.user.delete({ where: { id: session.userId } });

        // Send account deletion confirmation email
        if (user) {
            sendAccountDeletedEmail(user.email, user.firstName).catch(console.error);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { sendDonationApprovedEmail, sendDonationRejectedEmail } from '@/lib/email';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        if (!cookieStore.has('ws_admin_session')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (status !== 'approved' && status !== 'rejected' && status !== 'waiting') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Update the donation
        const donation = await db.donation.update({
            where: { id },
            data: { status },
            include: { donor: true },
        });

        // Send approval email
        if (status === 'approved' && donation.donor.email) {
            try {
                await sendDonationApprovedEmail(
                    donation.donor.email,
                    donation.donor.firstName,
                    donation.toyName
                );
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
            }
        }

        // Send rejection email
        if (status === 'rejected' && donation.donor.email) {
            try {
                await sendDonationRejectedEmail(
                    donation.donor.email,
                    donation.donor.firstName,
                    donation.toyName
                );
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError);
            }
        }

        return NextResponse.json({ success: true, status: donation.status });
    } catch (error) {
        console.error('Admin update error:', error);
        return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        if (!cookieStore.has('ws_admin_session')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete associated images first due to foreign key constraints, then the donation
        await db.donationImage.deleteMany({ where: { donationId: id } });
        await db.donation.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete error:', error);
        return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 });
    }
}

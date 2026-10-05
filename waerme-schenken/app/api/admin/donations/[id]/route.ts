import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendDonationApprovedEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/admin-auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authError = await requireAdmin();
        if (authError) return authError;
        const { id } = await params;

        const body = await request.json();
        const { status, category, ageRange, condition, toyName, description } = body;

        // If status is provided, validate it
        if (status && status !== 'approved' && status !== 'rejected' && status !== 'waiting') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (category) updateData.category = category;
        if (ageRange) updateData.ageRange = ageRange;
        if (condition) updateData.condition = condition;
        if (toyName) updateData.toyName = toyName;
        if (description !== undefined) updateData.description = description;

        const donation = await db.donation.update({
            where: { id },
            data: updateData,
            include: { donor: true },
        });

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
        const authError = await requireAdmin();
        if (authError) return authError;
        const { id } = await params;

        await db.donationImage.deleteMany({ where: { donationId: id } });
        await db.donation.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete error:', error);
        return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        const settings = await db.appSettings.upsert({
            where:  { id: 'singleton' },
            create: { id: 'singleton', familyApprovalRequired: true },
            update: {},
        });

        const [familiesWithSocialCard, totalDonations, totalDonationImages, totalReimbursementImages] =
            await Promise.all([
                db.user.count({ where: { role: 'family', socialCardUrl: { not: null } } }),
                db.donation.count(),
                db.donationImage.count(),
                db.reimbursementImage.count(),
            ]);

        const now = new Date();
        const isLocked =
            !!settings.lastResetAt &&
            (!settings.nextSeasonFrom || now < settings.nextSeasonFrom);

        return NextResponse.json({
            familiesWithSocialCard,
            totalDonations,
            totalDonationImages,
            totalReimbursementImages,
            lastResetAt:     settings.lastResetAt?.toISOString() ?? null,
            nextSeasonFrom:  settings.nextSeasonFrom?.toISOString() ?? null,
            isLocked,
        });
    } catch (err) {
        console.error('season-reset preview error', err);
        return NextResponse.json({ error: 'Failed to load preview' }, { status: 500 });
    }
}

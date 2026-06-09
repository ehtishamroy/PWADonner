import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

/**
 * GET /api/admin/season-reset/preview
 * Returns live counts of what will be deleted — used to populate the confirmation dialog.
 */
export async function GET() {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

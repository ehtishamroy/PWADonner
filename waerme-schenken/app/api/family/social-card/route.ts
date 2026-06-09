import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/family/social-card
 * Authenticated family-only endpoint to update their social card URL and org.
 * Called from the family profile page after a new image is uploaded via
 * the existing /api/upload/social-card endpoint.
 *
 * Also resets familyApproved = false so the admin must re-verify the new card.
 */
export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== 'family') {
        return NextResponse.json({ error: 'Nur für Familien.' }, { status: 403 });
    }

    const body = await req.json();
    const { socialCardUrl, socialCardOrg } = body as { socialCardUrl?: string; socialCardOrg?: string };

    if (!socialCardUrl || !socialCardOrg) {
        return NextResponse.json(
            { error: 'Bitte lade einen Sozialausweis hoch und wähle eine Organisation.' },
            { status: 400 },
        );
    }

    // Save new social card + reset approval so admin re-verifies
    const updated = await db.user.update({
        where: { id: session.userId },
        data: {
            socialCardUrl,
            socialCardOrg,
            familyApproved: false, // requires admin re-approval after upload
        },
    });

    return NextResponse.json({
        ok: true,
        socialCardUrl: updated.socialCardUrl,
        socialCardOrg: updated.socialCardOrg,
        familyApproved: updated.familyApproved,
    });
}

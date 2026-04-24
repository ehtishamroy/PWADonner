import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import {
    sendDonationSelectedEmail,
    sendFamilyOrderReceivedEmail,
} from '@/lib/email';

const MAX_ITEMS = 5;

// POST /api/family/checkout
// body: { donationIds: string[] }
// Selects the given donations atomically under row-level locking.
// Returns 409 if any is already taken — family must refresh cart.
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const family = await db.user.findUnique({ where: { id: session.userId } });
    if (!family || family.role !== 'family') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const isSpecial = (family as { familySpecial?: boolean }).familySpecial === true;
    if (!family.familyApproved && !isSpecial) {
        return NextResponse.json({ error: 'Noch nicht freigeschaltet.' }, { status: 403 });
    }
    if (!family.street || !family.city || !family.zipCode) {
        return NextResponse.json({ error: 'Bitte vervollständige deine Adresse.' }, { status: 400 });
    }

    const { donationIds } = await req.json();
    if (!Array.isArray(donationIds) || donationIds.length === 0) {
        return NextResponse.json({ error: 'Warenkorb ist leer.' }, { status: 400 });
    }
    if (donationIds.length > MAX_ITEMS) {
        return NextResponse.json({ error: `Maximal ${MAX_ITEMS} Spielzeuge pro Familie.` }, { status: 400 });
    }

    // Check family is not already at the 5-item limit including pre-existing selections
    const existingSelected = await db.donation.count({
        where: { selectedByFamilyId: family.id, status: { in: ['selected', 'sent'] } },
    });
    if (existingSelected + donationIds.length > MAX_ITEMS) {
        return NextResponse.json({
            error: `Maximal ${MAX_ITEMS} Spielzeuge pro Familie. Du hast bereits ${existingSelected} ausgewählt.`,
        }, { status: 400 });
    }

    try {
        // Atomic transaction with SELECT ... FOR UPDATE on each donation row.
        const result = await db.$transaction(async (tx) => {
            // Acquire row locks — fail fast if any row is not approved.
            // Using parameterized IN clause via $queryRawUnsafe would be risky; use a loop of safe queries.
            for (const id of donationIds) {
                const rows = await tx.$queryRaw<Array<{ id: string; status: string }>>`
                    SELECT id, status FROM "Donation" WHERE id = ${id} FOR UPDATE
                `;
                if (rows.length === 0) {
                    throw new Error('NOT_FOUND');
                }
                if (rows[0].status !== 'approved') {
                    throw new Error('CONFLICT');
                }
            }

            // All locks acquired and rows verified — update them.
            const updated = await tx.donation.updateMany({
                where: { id: { in: donationIds }, status: 'approved' },
                data: {
                    status: 'selected',
                    selectedByFamilyId: family.id,
                    selectedAt: new Date(),
                },
            });
            if (updated.count !== donationIds.length) {
                throw new Error('CONFLICT');
            }

            // Return the fresh rows (with donor info) for notifications.
            const donations = await tx.donation.findMany({
                where: { id: { in: donationIds } },
                include: { donor: { select: { email: true, firstName: true } } },
            });
            return donations;
        });

        // Fire-and-forget notifications
        const recipientAddress = `${family.street}\n${family.zipCode} ${family.city}`;
        const recipientName = `${family.firstName} ${family.lastName}`;

        await Promise.allSettled([
            ...result.map((d) =>
                sendDonationSelectedEmail(
                    d.donor.email,
                    d.donor.firstName,
                    d.toyName,
                    recipientName,
                    recipientAddress,
                )
            ),
            sendFamilyOrderReceivedEmail(
                family.email,
                family.firstName,
                result.map((d) => ({ toyName: d.toyName })),
            ),
        ]);

        return NextResponse.json({ ok: true, count: result.length });
    } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'CONFLICT') {
            return NextResponse.json({
                error: 'Ein Spielzeug wurde bereits ausgewählt. Bitte prüfe deinen Warenkorb.',
                code: 'CONFLICT',
            }, { status: 409 });
        }
        if (msg === 'NOT_FOUND') {
            return NextResponse.json({
                error: 'Ein Spielzeug wurde nicht gefunden.',
                code: 'NOT_FOUND',
            }, { status: 404 });
        }
        console.error('checkout error', err);
        return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
    }
}

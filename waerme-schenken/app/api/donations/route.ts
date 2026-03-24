import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendDonationReceivedEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const donations = await db.donation.findMany({
        where:   { donorId: session.userId },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(donations);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { toyName, category, ageRange, condition, description, imageUrls } = await req.json();

        if (!toyName || !category || !ageRange || !condition || !description) {
            return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
        }

        const user = await db.user.findUnique({ where: { id: session.userId } });
        if (!user) return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });

        const donation = await db.donation.create({
            data: {
                donorId:     session.userId,
                toyName,
                category,
                ageRange,
                condition,
                description,
                status: 'waiting',
                images: {
                    create: (imageUrls || []).map((url: string, i: number) => ({
                        imageUrl:  url,
                        sortOrder: i,
                    })),
                },
            },
            include: { images: true },
        });

        // Send confirmation email
        await sendDonationReceivedEmail(user.email, user.firstName, toyName).catch(console.error);

        return NextResponse.json(donation, { status: 201 });
    } catch (err) {
        console.error('POST /api/donations', err);
        return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// PATCH - Update donor's phone number
export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { phoneNumber } = await req.json();

        // Basic validation - Swiss phone format (optional but validated)
        if (phoneNumber && !/^\+?[\d\s\-]{10,}$/.test(phoneNumber)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        const user = await db.user.update({
            where: { id: session.userId },
            data: { phoneNumber: phoneNumber || null }
        });

        return NextResponse.json({ phoneNumber: user.phoneNumber });
    } catch (err) {
        console.error('phone update error', err);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// GET - Get donor's phone number
export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { phoneNumber: true }
        });

        return NextResponse.json({ phoneNumber: user?.phoneNumber || null });
    } catch (err) {
        console.error('phone get error', err);
        return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
    }
}

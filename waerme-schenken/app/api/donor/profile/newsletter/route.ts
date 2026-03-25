import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { consent } = body;

        if (typeof consent !== 'boolean') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const user = await db.user.update({
            where: { id: session.userId },
            data: { newsletterConsent: consent },
        });

        return NextResponse.json({ success: true, consent: user.newsletterConsent });
    } catch (error) {
        console.error('Newsletter update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

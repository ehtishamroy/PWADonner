import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { zipCode: true }
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
        
        // Update user
        await db.user.update({
            where: { id: session.userId },
            data: { zipCode: body.zipCode },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

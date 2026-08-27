import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const user = await db.user.findUnique({
        where:  { email: email.toLowerCase().trim() },
        select: { id: true },
    });

    if (!user) return NextResponse.json({ exists: false });

    return NextResponse.json({ exists: true }, { status: 409 });
}

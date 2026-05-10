import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const user = await db.user.findUnique({
        where:  { email: email.toLowerCase().trim() },
        select: { id: true, role: true },
    });

    if (!user) return NextResponse.json({ exists: false });

    const loginUrl = user.role === 'family' ? '/family/login' : '/donor/login';
    return NextResponse.json({ exists: true, loginUrl }, { status: 409 });
}

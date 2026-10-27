import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/email-utils';

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const user = await findUserByEmail(email);

    if (!user) return NextResponse.json({ exists: false });

    return NextResponse.json({ exists: true }, { status: 409 });
}

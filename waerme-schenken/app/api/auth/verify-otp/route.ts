import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyOtp, createSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'E-Mail und Code erforderlich.' }, { status: 400 });
        }

        const valid = await verifyOtp(email, code);
        if (!valid) {
            return NextResponse.json({ error: 'Der Code ist ungültig oder abgelaufen.' }, { status: 401 });
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });
        }

        const token = await createSession(user.id);
        const cookie = setSessionCookie(token);

        const response = NextResponse.json({ ok: true, userId: user.id });
        response.cookies.set(cookie);
        return response;
    } catch (err) {
        console.error('verify-otp error', err);
        return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
    }
}

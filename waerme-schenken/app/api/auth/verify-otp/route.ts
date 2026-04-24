import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';
import { sendFamilyRegistrationReceivedEmail } from '@/lib/email';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'E-Mail und Code erforderlich.' }, { status: 400 });
        }

        // Check if email is currently locked (any unexpired lock on the email)
        const locked = await db.otpCode.findFirst({
            where: { email, lockedUntil: { gt: new Date() } },
            orderBy: { lockedUntil: 'desc' },
        });
        if (locked && locked.lockedUntil) {
            return NextResponse.json({
                error: 'Zu viele Versuche. Bitte warte 30 Minuten.',
            }, { status: 429 });
        }

        // Find latest unused OTP for this email
        const otp = await db.otpCode.findFirst({
            where:   { email, used: false, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp) {
            return NextResponse.json({ error: 'Der Code ist ungültig oder abgelaufen.' }, { status: 401 });
        }

        if (otp.code !== code) {
            const newAttempts = otp.attempts + 1;
            const shouldLock = newAttempts >= MAX_ATTEMPTS;
            await db.otpCode.update({
                where: { id: otp.id },
                data: {
                    attempts: newAttempts,
                    lockedUntil: shouldLock
                        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
                        : undefined,
                    used: shouldLock ? true : undefined,
                },
            });
            if (shouldLock) {
                return NextResponse.json({
                    error: 'Zu viele Versuche. Bitte warte 30 Minuten.',
                }, { status: 429 });
            }
            return NextResponse.json({
                error: `Der Code ist ungültig. Noch ${MAX_ATTEMPTS - newAttempts} Versuch(e).`,
            }, { status: 401 });
        }

        // Valid: mark used
        await db.otpCode.update({
            where: { id: otp.id },
            data:  { used: true },
        });

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });
        }

        const token = await createSession(user.id);
        const cookie = setSessionCookie(token);

        // Email #5: first-time family registration — send only once
        if (user.role === 'family' && !user.familyApproved) {
            const sessionCount = await db.session.count({ where: { userId: user.id } });
            // sessionCount === 1 means this is the session we just created → first login
            if (sessionCount === 1) {
                sendFamilyRegistrationReceivedEmail(user.email, user.firstName).catch(console.error);
            }
        }

        const response = NextResponse.json({ ok: true, userId: user.id, role: user.role });
        response.cookies.set(cookie);
        return response;
    } catch (err) {
        console.error('verify-otp error', err);
        return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
    }
}

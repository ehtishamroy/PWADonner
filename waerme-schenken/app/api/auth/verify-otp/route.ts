import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';
import { sendFamilyRegistrationReceivedEmail } from '@/lib/email';
import { normalizeEmail, normalizeOtpCode, findUserByEmail } from '@/lib/email-utils';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // send-otp stores the code under the normalised (trimmed, lower-case)
        // address, so verification MUST look it up the same way — otherwise an
        // email typed/auto-filled with a capital letter can never be verified.
        const email = normalizeEmail(body?.email);
        const code  = normalizeOtpCode(body?.code);

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
            // Tell the user WHY, so they know what to do next (and so support can
            // tell "expired" apart from "replaced by a newer code").
            const latest = await db.otpCode.findFirst({
                where:   { email },
                orderBy: { createdAt: 'desc' },
            });
            let error = 'Der Code ist ungültig. Bitte fordere einen neuen Code an.';
            if (latest) {
                error = latest.expiresAt.getTime() <= Date.now()
                    ? 'Der Code ist abgelaufen. Bitte fordere einen neuen Code an.'
                    : 'Dieser Code ist nicht mehr gültig, weil bereits ein neuerer Code gesendet wurde. Bitte verwende den zuletzt erhaltenen Code oder fordere einen neuen an.';
            }
            console.warn('[verify-otp] no active code', {
                reason: !latest ? 'none' : latest.expiresAt.getTime() <= Date.now() ? 'expired' : 'used_or_replaced',
            });
            return NextResponse.json({ error }, { status: 401 });
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

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });
        }

        const token = await createSession(user.id, user.role);
        const cookie = setSessionCookie(token);

        // Email #5: first-time family registration — send only once
        if (user.role === 'family' && !user.familyApproved) {
            const sessionCount = await db.session.count({ where: { userId: user.id } });
            // sessionCount === 1 means this is the session we just created → first login
            if (sessionCount === 1) {
                const shopConfig = await db.shopConfig.findFirst();
                const openingDate = shopConfig?.openDate
                    ? shopConfig.openDate.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Zurich' })
                    : 'demnächst';
                sendFamilyRegistrationReceivedEmail(user.email, user.firstName, openingDate).catch(console.error);
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

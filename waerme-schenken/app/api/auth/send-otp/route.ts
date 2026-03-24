import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createOtp } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';
import { OTP_RATE_LIMIT } from '@/lib/constants';

export async function POST(req: NextRequest) {
    try {
        const { email, action, firstName, lastName, newsletter, privacy } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
        }

        // Rate limiting: max OTP_RATE_LIMIT per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentOtps = await db.otpCode.count({
            where: { email, createdAt: { gte: oneHourAgo } },
        });
        if (recentOtps >= OTP_RATE_LIMIT) {
            return NextResponse.json({ error: 'Zu viele Versuche. Bitte warte kurz.' }, { status: 429 });
        }

        // If register action, create or update user record
        if (action === 'register') {
            if (!privacy) {
                return NextResponse.json({ error: 'Datenschutz muss akzeptiert werden.' }, { status: 400 });
            }
            await db.user.upsert({
                where: { email },
                create: {
                    email,
                    firstName:         firstName || '',
                    lastName:          lastName  || '',
                    role:              'donor',
                    newsletterConsent: !!newsletter,
                },
                update: {
                    firstName:         firstName || undefined,
                    lastName:          lastName  || undefined,
                    newsletterConsent: newsletter != null ? !!newsletter : undefined,
                },
            });
        } else {
            // Login — user must exist
            const exists = await db.user.findUnique({ where: { email } });
            if (!exists) {
                // Silently succeed to prevent user enumeration
                return NextResponse.json({ ok: true });
            }
        }

        const code = await createOtp(email);
        await sendOtpEmail(email, code);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('send-otp error', err);
        return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
    }
}

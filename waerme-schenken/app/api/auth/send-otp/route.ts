import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createOtp } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';
import { OTP_RATE_LIMIT } from '@/lib/constants';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email, action,
            firstName, lastName,
            newsletter, privacy, emailShare,
            zipCode,
            // family-only:
            street, city, socialCardUrl, socialCardOrg,
        } = body;

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

        // Donor registration
        if (action === 'register') {
            if (!privacy) {
                return NextResponse.json({ error: 'Datenschutz muss akzeptiert werden.' }, { status: 400 });
            }
            const existing = await db.user.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json(
                    { error: 'Du hast bereits ein Konto. Bitte logge dich ein.', loginUrl: '/donor/login' },
                    { status: 409 },
                );
            }
            await db.user.create({
                data: {
                    email,
                    firstName:          firstName || '',
                    lastName:           lastName  || '',
                    role:               'donor',
                    newsletterConsent:  !!newsletter,
                    emailShareConsent:  !!emailShare,
                    zipCode:            zipCode || null,
                },
            });
        } else if (action === 'register-family') {
            if (!privacy) {
                return NextResponse.json({ error: 'Datenschutz muss akzeptiert werden.' }, { status: 400 });
            }
            if (!street || !city || !zipCode) {
                return NextResponse.json({ error: 'Vollständige Adresse erforderlich.' }, { status: 400 });
            }
            if (!socialCardUrl || !socialCardOrg) {
                return NextResponse.json({ error: 'Sozialausweis und Organisation erforderlich.' }, { status: 400 });
            }
            const existing = await db.user.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json(
                    { error: 'Du hast bereits ein Konto. Bitte logge dich ein.', loginUrl: '/family/login' },
                    { status: 409 },
                );
            }
            await db.user.create({
                data: {
                    email,
                    firstName:          firstName || '',
                    lastName:           lastName  || '',
                    role:               'family',
                    familyApproved:     false,
                    newsletterConsent:  !!newsletter,
                    zipCode,
                    street,
                    city,
                    socialCardUrl,
                    socialCardOrg,
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

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

        const normalizedEmail = email?.toLowerCase().trim();
        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
        }

        // Rate limiting: max OTP_RATE_LIMIT per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentOtps = await db.otpCode.count({
            where: { email: normalizedEmail, createdAt: { gte: oneHourAgo } },
        });
        if (recentOtps >= OTP_RATE_LIMIT) {
            return NextResponse.json({ error: 'Zu viele Versuche. Bitte warte kurz.' }, { status: 429 });
        }

        // Donor registration
        if (action === 'register') {
            if (!privacy) {
                return NextResponse.json({ error: 'Datenschutz muss akzeptiert werden.' }, { status: 400 });
            }
            const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
            if (existing) {
                const hasSessions = await db.session.count({ where: { userId: existing.id } });
                if (hasSessions > 0) {
                    return NextResponse.json(
                        { error: 'Du hast bereits ein Konto. Bitte logge dich ein.' },
                        { status: 409 },
                    );
                }
                // Unverified account (registered but never logged in): do NOT
                // delete or overwrite it here — this endpoint is unauthenticated,
                // so mutating an existing row would let anyone who knows the email
                // destroy or tamper a pending registration. Just re-send an OTP
                // against the existing row and let verification complete sign-up.
            } else {
                await db.user.create({
                    data: {
                        email: normalizedEmail,
                        firstName:          firstName || '',
                        lastName:           lastName  || '',
                        role:               'donor',
                        newsletterConsent:  !!newsletter,
                        emailShareConsent:  !!emailShare,
                        zipCode:            zipCode || null,
                        city:               city    || null,
                    },
                });
            }
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
            if (socialCardUrl.includes('..') || !/^\/api\/uploads\/social-cards\/[a-f0-9]+\.\w+$/.test(socialCardUrl)) {
                return NextResponse.json({ error: 'Ungültige Sozialausweis-URL.' }, { status: 400 });
            }
            const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
            if (existing) {
                const hasSessions = await db.session.count({ where: { userId: existing.id } });
                if (hasSessions > 0) {
                    return NextResponse.json(
                        { error: 'Du hast bereits ein Konto. Bitte logge dich ein.' },
                        { status: 409 },
                    );
                }
                // Unverified account: do NOT delete or overwrite here (see donor
                // branch above) — just re-send an OTP against the existing row.
            } else {
                await db.user.create({
                    data: {
                        email: normalizedEmail,
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
            }
        } else {
            // Login — user must exist
            const exists = await db.user.findUnique({ where: { email: normalizedEmail } });
            if (!exists) {
                return NextResponse.json({ userNotFound: true }, { status: 404 });
            }
        }

        const code = await createOtp(normalizedEmail);
        await sendOtpEmail(normalizedEmail, code);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('send-otp error', err);
        return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
    }
}

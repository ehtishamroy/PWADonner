import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
import { OTP_EXPIRY_MINUTES, SESSION_DURATION_DAYS } from './constants';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'dev-secret-change-in-production-32chars!!'
);

// ── OTP ────────────────────────────────────────────────────────────────────

export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtp(email: string): Promise<string> {
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate previous unused OTPs for this email
    await db.otpCode.updateMany({
        where: { email, used: false },
        data:  { used: true },
    });

    await db.otpCode.create({
        data: { email, code, expiresAt },
    });

    return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
    const otp = await db.otpCode.findFirst({
        where: {
            email,
            code,
            used:      false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!otp) return false;

    await db.otpCode.update({
        where: { id: otp.id },
        data:  { used: true },
    });

    return true;
}

// ── Session JWT ─────────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
        .setIssuedAt()
        .sign(JWT_SECRET);

    await db.session.create({
        data: { userId, token, expiresAt },
    });

    return token;
}

export async function getSession(): Promise<{ userId: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('ws_session')?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Check DB (allows server-side invalidation / logout)
        const session = await db.session.findFirst({
            where: {
                token,
                expiresAt: { gt: new Date() },
            },
        });

        if (!session) return null;

        return { userId: payload.userId as string };
    } catch {
        return null;
    }
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get('ws_session')?.value;
    if (token) {
        await db.session.deleteMany({ where: { token } }).catch(() => {});
    }
}

// ── Cookie helpers ──────────────────────────────────────────────────────────

export function setSessionCookie(token: string) {
    return {
        name:     'ws_session',
        value:    token,
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path:     '/',
        maxAge:   SESSION_DURATION_DAYS * 24 * 60 * 60,
    };
}

export function clearSessionCookie() {
    return {
        name:    'ws_session',
        value:   '',
        maxAge:  0,
        path:    '/',
    };
}

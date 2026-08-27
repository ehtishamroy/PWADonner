import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { createAdminSession, setAdminSessionCookie } from '@/lib/auth';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLoginAttempt(key: string): { allowed: boolean; remainingMinutes?: number } {
    const record = loginAttempts.get(key);
    if (!record) return { allowed: true };
    if (Date.now() > record.lockedUntil) {
        loginAttempts.delete(key);
        return { allowed: true };
    }
    if (record.count >= MAX_ATTEMPTS) {
        const remaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
        return { allowed: false, remainingMinutes: remaining };
    }
    return { allowed: true };
}

function recordFailedAttempt(key: string) {
    const record = loginAttempts.get(key);
    const count = (record?.count ?? 0) + 1;
    loginAttempts.set(key, {
        count,
        lockedUntil: count >= MAX_ATTEMPTS
            ? Date.now() + LOCK_MINUTES * 60 * 1000
            : record?.lockedUntil ?? 0,
    });
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const validEmail = process.env.ADMIN_EMAIL;
        const validPassword = process.env.ADMIN_PASSWORD;

        if (!validEmail || !validPassword) {
            return NextResponse.json({ error: 'Admin credentials not configured on server' }, { status: 500 });
        }

        const attemptKey = (email || '').toLowerCase();
        const check = checkLoginAttempt(attemptKey);
        if (!check.allowed) {
            return NextResponse.json(
                { error: `Zu viele Versuche. Bitte warte ${check.remainingMinutes} Minuten.` },
                { status: 429 },
            );
        }

        if (email === validEmail && password === validPassword) {
            loginAttempts.delete(attemptKey);

            const adminUser = await db.user.upsert({
                where: { email: validEmail },
                create: { email: validEmail, firstName: 'Admin', lastName: '', role: 'admin' },
                update: { role: 'admin' },
            });

            const token = await createAdminSession(adminUser.id);
            const cookieStore = await cookies();
            cookieStore.set(setAdminSessionCookie(token));

            return NextResponse.json({ success: true });
        }

        recordFailedAttempt(attemptKey);
        return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 });
    }
}

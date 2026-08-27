import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;
const attempts = new Map<string, { count: number; lockedUntil: number }>();

function checkAttempt(key: string): { allowed: boolean; remainingMinutes?: number } {
    const record = attempts.get(key);
    if (!record) return { allowed: true };
    if (Date.now() > record.lockedUntil) {
        attempts.delete(key);
        return { allowed: true };
    }
    if (record.count >= MAX_ATTEMPTS) {
        const remaining = Math.ceil((record.lockedUntil - Date.now()) / 60000);
        return { allowed: false, remainingMinutes: remaining };
    }
    return { allowed: true };
}

function recordFailedAttempt(key: string) {
    const record = attempts.get(key);
    const count = (record?.count ?? 0) + 1;
    attempts.set(key, {
        count,
        lockedUntil: count >= MAX_ATTEMPTS
            ? Date.now() + LOCK_MINUTES * 60 * 1000
            : record?.lockedUntil ?? 0,
    });
}

export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const check = checkAttempt(session.userId);
    if (!check.allowed) {
        return NextResponse.json(
            { error: `Zu viele Versuche. Bitte warte ${check.remainingMinutes} Minuten.` },
            { status: 429 },
        );
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Aktuelles und neues Passwort erforderlich.' }, { status: 400 });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return NextResponse.json({ error: 'Neues Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 });
    }
    if (newPassword === currentPassword) {
        return NextResponse.json({ error: 'Neues Passwort muss sich vom aktuellen unterscheiden.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentOk = user.passwordHash
        ? await verifyPassword(currentPassword, user.passwordHash)
        : currentPassword === process.env.ADMIN_PASSWORD;

    if (!currentOk) {
        recordFailedAttempt(session.userId);
        return NextResponse.json({ error: 'Aktuelles Passwort ist falsch.' }, { status: 403 });
    }
    attempts.delete(session.userId);

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({ where: { id: session.userId }, data: { passwordHash } });

    return NextResponse.json({ success: true });
}

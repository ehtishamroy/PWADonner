import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs   from 'fs';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { verifyUploadTicket } from '@/lib/upload-ticket';
import { ensurePrivateDir, privateUploadUrl } from '@/lib/storage';

export const runtime = 'nodejs';

const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = uploadAttempts.get(key);
    if (!entry || now > entry.resetAt) {
        uploadAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

const MAGIC_BYTES: Record<string, number[]> = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png:  [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46],
    gif:  [0x47, 0x49, 0x46],
};

function isValidImage(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;
    return Object.values(MAGIC_BYTES).some(magic =>
        magic.every((byte, i) => buffer[i] === byte)
    );
}

export async function POST(req: NextRequest) {
    try {
        // ── Authorisation ── an authenticated family (profile update) OR a
        // valid short-lived upload ticket (registration, no session yet).
        const session = await getSession();
        let authKey: string | null = session ? `user:${session.userId}` : null;
        if (!session) {
            const ticket = req.headers.get('x-upload-ticket');
            if (await verifyUploadTicket(ticket)) {
                authKey = 'ticket';
            }
        }
        if (!authKey) {
            return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
        }

        // Secondary anti-abuse guard (per-session, or per-IP for ticket uploads).
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rlKey = authKey === 'ticket' ? `ip:${ip}` : authKey;
        if (isRateLimited(rlKey)) {
            return NextResponse.json({ error: 'Zu viele Uploads. Bitte später erneut versuchen.' }, { status: 429 });
        }

        const dir = ensurePrivateDir('social-cards');

        const formData = await req.formData();
        const file     = formData.get('file') as Blob | null;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei gefunden.' }, { status: 400 });
        }

        const fileType = (file as File).type;
        if (!fileType.startsWith('image/')) {
            return NextResponse.json({ error: 'Nur Bilder erlaubt.' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu gross (max. 5 MB).' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        if (!isValidImage(buffer)) {
            return NextResponse.json({ error: 'Ungültiges Bildformat.' }, { status: 400 });
        }

        const rawExt = fileType.split('/')[1]?.split('+')[0]?.toLowerCase() || 'jpg';
        const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']);
        const ext = allowed.has(rawExt) ? rawExt.replace('jpeg', 'jpg') : 'jpg';

        const randomId = crypto.randomBytes(16).toString('hex');
        const filename = `${randomId}.${ext}`;
        fs.writeFileSync(path.join(dir, filename), buffer);

        return NextResponse.json(
            { url: privateUploadUrl('social-cards', filename) },
            { status: 201 },
        );
    } catch (err) {
        console.error('social-card upload error', err);
        return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
}

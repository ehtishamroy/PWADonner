import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs   from 'fs';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { verifyUploadTicket } from '@/lib/upload-ticket';
import { ensurePrivateDir, privateUploadUrl } from '@/lib/storage';
import { toWebImage, ImageProcessingError, IMAGE_ERROR_MESSAGE } from '@/lib/image-processing';

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

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu gross (max. 10 MB).' }, { status: 400 });
        }

        // The content is checked by decoding it (no reliance on the MIME type,
        // which is often empty for HEIC) and converted to a web-safe JPEG.
        let image;
        try {
            image = await toWebImage(Buffer.from(await file.arrayBuffer()));
        } catch (err) {
            if (err instanceof ImageProcessingError) {
                console.warn('[social-card] rejected image:', err.message);
                return NextResponse.json({ error: IMAGE_ERROR_MESSAGE }, { status: 400 });
            }
            throw err;
        }

        const randomId = crypto.randomBytes(16).toString('hex');
        const filename = `${randomId}.${image.ext}`;
        fs.writeFileSync(path.join(dir, filename), image.buffer);

        return NextResponse.json(
            { url: privateUploadUrl('social-cards', filename) },
            { status: 201 },
        );
    } catch (err) {
        console.error('social-card upload error', err);
        return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
}

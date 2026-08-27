import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs   from 'fs';
import crypto from 'crypto';

export const runtime = 'nodejs';

const DIR = path.join(process.cwd(), 'public', 'uploads', 'social-cards');

function ensureDir() {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = uploadAttempts.get(ip);
    if (!entry || now > entry.resetAt) {
        uploadAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
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
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Zu viele Uploads. Bitte später erneut versuchen.' }, { status: 429 });
        }

        ensureDir();

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
        const filepath = path.join(DIR, filename);

        fs.writeFileSync(filepath, buffer);

        return NextResponse.json(
            { url: `/uploads/social-cards/${filename}` },
            { status: 201 },
        );
    } catch (err) {
        console.error('social-card upload error', err);
        return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
}

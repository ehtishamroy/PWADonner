import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs   from 'fs';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Public (unauthenticated) upload endpoint for family social-card photos
 * submitted DURING registration — i.e. before any session exists.
 * Tight constraints:
 *   - image/* only, max 5 MB
 *   - random filename (no user id available yet)
 *   - written to /public/uploads/social-cards/
 *
 * The returned URL is stored on the User row when registration POSTs to
 * /api/auth/send-otp with action=register-family.
 */
const DIR = path.join(process.cwd(), 'public', 'uploads', 'social-cards');

function ensureDir() {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
    try {
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

        const rawExt = fileType.split('/')[1]?.split('+')[0]?.toLowerCase() || 'jpg';
        const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']);
        const ext = allowed.has(rawExt) ? rawExt.replace('jpeg', 'jpg') : 'jpg';

        const randomId = crypto.randomBytes(16).toString('hex');
        const filename = `${randomId}.${ext}`;
        const filepath = path.join(DIR, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
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

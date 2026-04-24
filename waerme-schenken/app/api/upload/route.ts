import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { ensureUploadDir, getPublicUrl, UPLOAD_DIR } from '@/lib/storage';
import path from 'path';
import fs   from 'fs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        ensureUploadDir();

        const formData = await req.formData();
        const file     = formData.get('file') as Blob | null;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei gefunden.' }, { status: 400 });
        }

        // Validate type
        const fileType = (file as File).type;
        if (!fileType.startsWith('image/')) {
            return NextResponse.json({ error: 'Nur Bilder erlaubt.' }, { status: 400 });
        }

        // Validate size (5 MB max to accommodate mobile photos)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu gross (max. 5 MB).' }, { status: 400 });
        }

        // Sanitize extension: only allow jpg/png/webp/gif/heic
        const rawExt = fileType.split('/')[1]?.split('+')[0]?.toLowerCase() || 'jpg';
        const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']);
        const ext = allowed.has(rawExt) ? rawExt.replace('jpeg', 'jpg') : 'jpg';
        const filename = `${session.userId}-${Date.now()}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

        return NextResponse.json({ url: getPublicUrl(filename) }, { status: 201 });
    } catch (err) {
        console.error('upload error', err);
        return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
}

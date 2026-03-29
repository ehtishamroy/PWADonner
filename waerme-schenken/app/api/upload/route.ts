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

        // Validate size (3 MB max)
        if (file.size > 3 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu groß (max. 3 MB).' }, { status: 400 });
        }

        const ext      = fileType.split('/')[1].replace('jpeg', 'jpg');
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

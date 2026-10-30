import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { ensureUploadDir, getPublicUrl, UPLOAD_DIR } from '@/lib/storage';
import { toWebImage, ImageProcessingError, IMAGE_ERROR_MESSAGE } from '@/lib/image-processing';
import path from 'path';
import fs   from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
        const fileName = (file as File).name || '';
        const extMatch = fileName.match(/\.([^.]+)$/);
        const fileExt = extMatch ? extMatch[1].toLowerCase() : '';

        const isImage = fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'].includes(fileExt);

        if (!isImage) {
            return NextResponse.json({ error: 'Nur Bilder erlaubt.' }, { status: 400 });
        }

        // Validate size (10 MB max to accommodate mobile photos)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu gross (max. 10 MB).' }, { status: 400 });
        }

        // Convert to a web-safe JPEG (HEIC from iPhones included). The stored
        // extension comes from the converted content, never from the client.
        let image;
        try {
            image = await toWebImage(Buffer.from(await file.arrayBuffer()));
        } catch (err) {
            if (err instanceof ImageProcessingError) {
                console.warn('[upload] rejected image:', err.message);
                return NextResponse.json({ error: IMAGE_ERROR_MESSAGE }, { status: 400 });
            }
            throw err;
        }
        const filename = `${session.userId}-${Date.now()}.${image.ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        fs.writeFileSync(filepath, image.buffer);

        return NextResponse.json({ url: getPublicUrl(filename) }, { status: 201 });
    } catch (err) {
        console.error('upload error', err);
        return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
}

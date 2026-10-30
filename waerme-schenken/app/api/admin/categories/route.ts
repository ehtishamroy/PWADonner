import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureUploadDir, getPublicUrl, UPLOAD_DIR } from '@/lib/storage';
import { toWebImage, ImageProcessingError, IMAGE_ERROR_MESSAGE } from '@/lib/image-processing';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;
    const items = await db.categoryImage.findMany();
    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        ensureUploadDir();

        const formData = await req.formData();
        const file     = formData.get('file') as Blob | null;
        const category = formData.get('category') as string | null;

        if (!file || !category) {
            return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu gross (max. 5 MB).' }, { status: 400 });
        }

        let image;
        try {
            image = await toWebImage(Buffer.from(await file.arrayBuffer()));
        } catch (err) {
            if (err instanceof ImageProcessingError) {
                console.warn('[category-image] rejected image:', err.message);
                return NextResponse.json({ error: IMAGE_ERROR_MESSAGE }, { status: 400 });
            }
            throw err;
        }
        const filename = `category-${Date.now()}.${image.ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        fs.writeFileSync(filepath, image.buffer);

        const url = getPublicUrl(filename);
        const saved = await db.categoryImage.upsert({
            where:  { category },
            create: { category, imageUrl: url },
            update: { imageUrl: url },
        });

        return NextResponse.json({ ok: true, item: saved });
    } catch (err) {
        console.error('category image upload error', err);
        return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    if (!category) return NextResponse.json({ error: 'category missing' }, { status: 400 });

    await db.categoryImage.deleteMany({ where: { category } });
    return NextResponse.json({ ok: true });
}

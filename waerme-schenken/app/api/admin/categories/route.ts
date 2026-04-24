import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { ensureUploadDir, getPublicUrl, UPLOAD_DIR } from '@/lib/storage';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

export async function GET() {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const items = await db.categoryImage.findMany();
    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        ensureUploadDir();

        const formData = await req.formData();
        const file     = formData.get('file') as Blob | null;
        const category = formData.get('category') as string | null;

        if (!file || !category) {
            return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
        }

        const fileType = (file as File).type;
        if (!fileType.startsWith('image/')) {
            return NextResponse.json({ error: 'Nur Bilder erlaubt.' }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu gross (max. 5 MB).' }, { status: 400 });
        }

        const rawExt = fileType.split('/')[1]?.split('+')[0]?.toLowerCase() || 'jpg';
        const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
        const ext = allowed.has(rawExt) ? rawExt.replace('jpeg', 'jpg') : 'jpg';
        const filename = `category-${Date.now()}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

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
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    if (!category) return NextResponse.json({ error: 'category missing' }, { status: 400 });

    await db.categoryImage.deleteMany({ where: { category } });
    return NextResponse.json({ ok: true });
}

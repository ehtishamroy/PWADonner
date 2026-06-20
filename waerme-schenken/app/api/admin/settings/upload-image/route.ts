import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { ASSET_BASE_PATHS, RESOLVE_ORDER } from '@/lib/assetPaths';

export async function POST(request: Request) {
    // 1. Validate Admin Session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ws_admin_session')?.value;
    if (sessionCookie !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Parse FormData
        const formData = await request.formData();
        const file     = formData.get('file')   as File   | null;
        const typeId   = formData.get('typeId') as string | null;

        if (!file || !typeId || !ASSET_BASE_PATHS[typeId]) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // 3. Determine extension from uploaded filename
        const originalExt = path.extname(file.name).toLowerCase();
        let ext = '.png';
        if (originalExt === '.svg')                   ext = '.svg';
        else if (originalExt === '.jpg' || originalExt === '.jpeg') ext = '.jpg';

        // 4. Remove all existing variants of this asset
        const publicDir  = path.join(process.cwd(), 'public');
        const basePath   = path.join(publicDir, ASSET_BASE_PATHS[typeId]);

        for (const e of RESOLVE_ORDER) {
            try { await fs.unlink(basePath + e); } catch { /* file may not exist */ }
        }

        // 5. Write new file
        const bytes  = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.writeFile(basePath + ext, buffer);

        return NextResponse.json({ success: true, message: 'Asset replaced' });
    } catch (error) {
        console.error('Asset upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import fs from 'fs/promises';
import path from 'path';
import { ASSET_BASE_PATHS, RESOLVE_ORDER } from '@/lib/assetPaths';

export async function POST(request: Request) {
    const authError = await requireAdmin();
    if (authError) return authError;

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

        // 5. Write new file (sanitize SVG)
        const bytes  = await file.arrayBuffer();
        let buffer = Buffer.from(bytes);

        if (ext === '.svg') {
            let svg = buffer.toString('utf-8');
            svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
            svg = svg.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
            svg = svg.replace(/javascript\s*:/gi, 'blocked:');
            svg = svg.replace(/href\s*=\s*"data:[^"]*"/gi, 'href=""');
            svg = svg.replace(/href\s*=\s*'data:[^']*'/gi, "href=''");
            buffer = Buffer.from(svg, 'utf-8');
        }

        await fs.writeFile(basePath + ext, buffer);

        return NextResponse.json({ success: true, message: 'Asset replaced' });
    } catch (error) {
        console.error('Asset upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

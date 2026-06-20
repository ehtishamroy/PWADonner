import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ASSET_BASE_PATHS, RESOLVE_ORDER } from '@/lib/assetPaths';

const CONTENT_TYPES: Record<string, string> = {
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
};

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const basePath = ASSET_BASE_PATHS[id];

    if (!basePath) {
        return new NextResponse(null, { status: 404 });
    }

    const publicDir = path.join(process.cwd(), 'public');

    for (const ext of RESOLVE_ORDER) {
        const filePath = path.join(publicDir, basePath + ext);
        if (fs.existsSync(filePath)) {
            const file = fs.readFileSync(filePath);
            return new NextResponse(file, {
                headers: {
                    'Content-Type':  CONTENT_TYPES[ext] ?? 'application/octet-stream',
                    'Cache-Control': 'no-cache, must-revalidate',
                },
            });
        }
    }

    return new NextResponse(null, { status: 404 });
}

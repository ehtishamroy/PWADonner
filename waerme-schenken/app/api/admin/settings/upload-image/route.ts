import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

// Mapping from ID to physical path relative to process.cwd()
const ASSET_PATHS: Record<string, string> = {
    'logo':           'public/images/logo.png',
    'ill-helicopter': 'public/images/helicopter.png',
    'ill-teddy':      'public/images/teddy.png',
    'ill-gift':       'public/images/gift.png',
    'ill-gift-dashboard': 'public/images/gift-dashboard.png',
    'ill-duck':       'public/images/duck.png',
    'ill-car':        'public/images/car.png',
    'ill-zebracat':   'public/images/zebracat.png',
    'icon-status-waiting':  'public/images/icon-status-waiting.png',
    'icon-status-approved': 'public/images/icon-status-approved.png',
    'icon-status-selected': 'public/images/icon-status-selected.png',
    'icon-status-sent':     'public/images/icon-status-sent.png',
    'icon-status-rejected': 'public/images/icon-status-rejected.png',
    'icon-selected-action': 'public/images/icon-selected-action.png',
    'icon-profile-edit':    'public/images/icon-profile-edit.png',
    'split-photo':    'public/images/split-photo.jpg',
    'favicon':        'public/favicon.png',
    'icon192':        'public/icons/icon-192x192.png',
    'icon512':        'public/icons/icon-512x512.png',
    'apple-icon':     'public/icons/apple-touch-icon.png',
};

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
        const file = formData.get('file') as File | null;
        const typeId = formData.get('typeId') as string | null;

        if (!file || !typeId || !ASSET_PATHS[typeId]) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // 3. Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 4. Overwrite existing file path on VPS disk
        const targetPath = path.join(process.cwd(), ASSET_PATHS[typeId]);
        await fs.writeFile(targetPath, buffer);

        return NextResponse.json({ success: true, message: 'Asset replaced' });
    } catch (error) {
        console.error('Asset upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

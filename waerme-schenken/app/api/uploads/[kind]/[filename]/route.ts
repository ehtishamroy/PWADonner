import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getSession, getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { resolvePrivateUploadPath } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONTENT_TYPES: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', gif: 'image/gif', heic: 'image/heic',
};

/**
 * Authenticated serving of sensitive uploads (social cards, reimbursement
 * receipts). These files live outside public/ and are NEVER served statically.
 * Access: admins see everything; a family sees only their own social card; a
 * donor sees only their own reimbursement receipts.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ kind: string; filename: string }> },
) {
    const { kind, filename } = await params;
    if (kind !== 'social-cards' && kind !== 'reimbursements') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const url = `/api/uploads/${kind}/${filename}`;
    const abs = resolvePrivateUploadPath(url);
    if (!abs) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // ── Authorisation ──
    let allowed = !!(await getAdminSession());
    if (!allowed) {
        const session = await getSession();
        if (session) {
            if (kind === 'social-cards') {
                const u = await db.user.findUnique({
                    where: { id: session.userId },
                    select: { socialCardUrl: true },
                });
                allowed = u?.socialCardUrl === url;
            } else {
                const img = await db.reimbursementImage.findFirst({
                    where: { imageUrl: url },
                    select: { reimbursement: { select: { donorId: true } } },
                });
                allowed = img?.reimbursement?.donorId === session.userId;
            }
        }
    }
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    let data: Buffer;
    try {
        data = await fs.promises.readFile(abs);
    } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(new Uint8Array(data), {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}

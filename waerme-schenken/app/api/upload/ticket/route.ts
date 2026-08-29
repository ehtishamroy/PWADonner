import { NextRequest, NextResponse } from 'next/server';
import { issueUploadTicket } from '@/lib/upload-ticket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Light per-IP rate limit so tickets can't be minted without bound.
const WINDOW = 60 * 60 * 1000;
const MAX = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string): boolean {
    const now = Date.now();
    const e = hits.get(ip);
    if (!e || now > e.resetAt) {
        hits.set(ip, { count: 1, resetAt: now + WINDOW });
        return false;
    }
    e.count++;
    return e.count > MAX;
}

// Issues a short-lived signed ticket used to authorise a social-card upload
// during registration (before a session exists). Writes nothing to disk.
export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (limited(ip)) {
        return NextResponse.json({ error: 'Zu viele Anfragen.' }, { status: 429 });
    }
    const ticket = await issueUploadTicket();
    return NextResponse.json({ ticket });
}

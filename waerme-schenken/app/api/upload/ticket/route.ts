import { NextResponse } from 'next/server';
import { issueUploadTicket } from '@/lib/upload-ticket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Issues a short-lived signed ticket used to authorise a social-card upload
// during registration (before a session exists). Writes nothing to disk.
export async function GET() {
    const ticket = await issueUploadTicket();
    return NextResponse.json({ ticket });
}

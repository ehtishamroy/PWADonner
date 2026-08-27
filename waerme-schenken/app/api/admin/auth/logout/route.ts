import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { deleteAdminSession, clearAdminSessionCookie } from '@/lib/auth';

export async function POST() {
    await deleteAdminSession();
    const cookieStore = await cookies();
    cookieStore.set(clearAdminSessionCookie());

    return NextResponse.json({ success: true });
}

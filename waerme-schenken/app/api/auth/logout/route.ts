import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth';

export async function POST() {
    await deleteSession();
    
    // Clear the cookie securely from the browser
    const cookieStore = await cookies();
    cookieStore.delete('ws_session');
    
    return NextResponse.json({ success: true });
}

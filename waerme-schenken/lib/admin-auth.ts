import { NextResponse } from 'next/server';
import { getAdminSession } from './auth';

export async function requireAdmin(): Promise<NextResponse | null> {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

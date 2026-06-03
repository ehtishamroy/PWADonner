import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

function requireAdmin(cookieStore: Awaited<ReturnType<typeof cookies>>) {
    if (!cookieStore.has('ws_admin_session')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const authError = requireAdmin(cookieStore);
    if (authError) return authError;

    const { id } = params;

    try {
        const user = await db.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (user.role === 'admin') {
            return NextResponse.json({ error: 'Admin-Benutzer können nicht gelöscht werden.' }, { status: 400 });
        }

        await db.user.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('admin delete user error', err);
        return NextResponse.json({ error: 'Löschen fehlgeschlagen.' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

export async function GET() {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const b = await db.newsBanner.findFirst({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(b);
}

export async function PATCH(req: NextRequest) {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { title, body, isActive } = await req.json();
    if (!title || typeof title !== 'string') {
        return NextResponse.json({ error: 'Titel erforderlich.' }, { status: 400 });
    }

    const existing = await db.newsBanner.findFirst({ orderBy: { createdAt: 'desc' } });
    if (existing) {
        // If activating this banner, deactivate all others
        if (isActive) {
            await db.newsBanner.updateMany({ data: { isActive: false } });
        }
        const updated = await db.newsBanner.update({
            where: { id: existing.id },
            data:  { title, body: body || '', isActive: !!isActive },
        });
        return NextResponse.json(updated);
    }

    if (isActive) await db.newsBanner.updateMany({ data: { isActive: false } });
    const created = await db.newsBanner.create({
        data: { title, body: body || '', isActive: !!isActive },
    });
    return NextResponse.json(created);
}

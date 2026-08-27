import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;
    const b = await db.newsBanner.findFirst({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(b);
}

export async function PATCH(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { title, body, isActive } = await req.json();
    if (!title || typeof title !== 'string') {
        return NextResponse.json({ error: 'Titel erforderlich.' }, { status: 400 });
    }

    const existing = await db.newsBanner.findFirst({ orderBy: { createdAt: 'desc' } });
    if (existing) {
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

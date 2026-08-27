import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;
    const categories = await db.toyCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ categories });
}

export async function POST(req: Request) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Name erforderlich.' }, { status: 400 });
    }
    const trimmed = name.trim();
    const existing = await db.toyCategory.findUnique({ where: { name: trimmed } });
    if (existing) {
        return NextResponse.json({ error: 'Kategorie existiert bereits.' }, { status: 409 });
    }
    const maxOrder = await db.toyCategory.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const category = await db.toyCategory.create({ data: { name: trimmed, sortOrder } });
    return NextResponse.json({ ok: true, category });
}

export async function PATCH(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { order } = await req.json();
    if (!Array.isArray(order)) return NextResponse.json({ error: 'order array required' }, { status: 400 });
    await Promise.all(order.map((name: string, i: number) =>
        db.toyCategory.update({ where: { name }, data: { sortOrder: i } })
    ));
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    if (!name) return NextResponse.json({ error: 'name missing' }, { status: 400 });

    await db.categoryImage.deleteMany({ where: { category: name } });
    await db.toyCategory.deleteMany({ where: { name } });
    return NextResponse.json({ ok: true });
}

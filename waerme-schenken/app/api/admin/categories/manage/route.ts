import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

export async function GET() {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const categories = await db.toyCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ categories });
}

export async function POST(req: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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

export async function DELETE(req: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    if (!name) return NextResponse.json({ error: 'name missing' }, { status: 400 });

    await db.categoryImage.deleteMany({ where: { category: name } });
    await db.toyCategory.deleteMany({ where: { name } });
    return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;
    const orgs = await (db as any).socialCardOrg.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    return NextResponse.json({ orgs });
}

export async function POST(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name erforderlich.' }, { status: 400 });
    const count = await (db as any).socialCardOrg.count();
    const org = await (db as any).socialCardOrg.create({ data: { name: name.trim(), sortOrder: count } });
    return NextResponse.json(org, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const body = await req.json();
    if (Array.isArray(body.order)) {
        await Promise.all(body.order.map((id: string, i: number) =>
            (db as any).socialCardOrg.update({ where: { id }, data: { sortOrder: i } })
        ));
        return NextResponse.json({ ok: true });
    }
    const { id, name } = body;
    if (!id || !name?.trim()) return NextResponse.json({ error: 'ID und Name erforderlich.' }, { status: 400 });
    const org = await (db as any).socialCardOrg.update({ where: { id }, data: { name: name.trim() } });
    return NextResponse.json(org);
}

export async function DELETE(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID erforderlich.' }, { status: 400 });
    try {
        await (db as any).socialCardOrg.delete({ where: { id } });
    } catch (e: any) {
        if (e?.code === 'P2025') return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });
        throw e;
    }
    return NextResponse.json({ ok: true });
}

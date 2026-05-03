import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function isAdmin() {
    const jar = await cookies();
    return !!jar.get('ws_admin_session')?.value;
}

export async function GET() {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const orgs = await (db as any).socialCardOrg.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    return NextResponse.json({ orgs });
}

export async function POST(req: NextRequest) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name erforderlich.' }, { status: 400 });
    const count = await (db as any).socialCardOrg.count();
    const org = await (db as any).socialCardOrg.create({ data: { name: name.trim(), sortOrder: count } });
    return NextResponse.json(org, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, name } = await req.json();
    if (!id || !name?.trim()) return NextResponse.json({ error: 'ID und Name erforderlich.' }, { status: 400 });
    const org = await (db as any).socialCardOrg.update({ where: { id }, data: { name: name.trim() } });
    return NextResponse.json(org);
}

export async function DELETE(req: NextRequest) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID erforderlich.' }, { status: 400 });
    await (db as any).socialCardOrg.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const orgs = await (db as any).socialCardOrg.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    return NextResponse.json({ orgs: orgs.map((o: any) => o.name) });
}

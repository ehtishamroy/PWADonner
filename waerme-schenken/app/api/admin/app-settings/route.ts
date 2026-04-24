import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

export async function GET() {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const s = await db.appSettings.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', familyApprovalRequired: true },
        update: {},
    });
    return NextResponse.json(s);
}

export async function PATCH(req: NextRequest) {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const s = await db.appSettings.upsert({
        where:  { id: 'singleton' },
        create: { id: 'singleton', familyApprovalRequired: !!body.familyApprovalRequired },
        update: { familyApprovalRequired: !!body.familyApprovalRequired },
    });
    return NextResponse.json(s);
}

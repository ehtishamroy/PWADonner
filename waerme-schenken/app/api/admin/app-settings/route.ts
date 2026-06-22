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

    // Build update payload — only include provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if ('familyApprovalRequired' in body) {
        updateData.familyApprovalRequired = !!body.familyApprovalRequired;
    }
    if ('financialSupportEnabled' in body) {
        updateData.financialSupportEnabled = !!body.financialSupportEnabled;
    }
    if ('nextSeasonFrom' in body) {
        updateData.nextSeasonFrom = body.nextSeasonFrom ? new Date(body.nextSeasonFrom) : null;
    }

    const s = await db.appSettings.upsert({
        where:  { id: 'singleton' },
        create: { id: 'singleton', familyApprovalRequired: true, ...updateData },
        update: updateData,
    });
    return NextResponse.json(s);
}

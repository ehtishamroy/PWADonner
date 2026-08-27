import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;
    const s = await db.appSettings.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', familyApprovalRequired: true },
        update: {},
    });
    return NextResponse.json(s);
}

export async function PATCH(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;
    const body = await req.json();

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

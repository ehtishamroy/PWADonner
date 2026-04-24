import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { sendFamilyRegistrationApprovedEmail } from '@/lib/email';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    let approveFlag: boolean | undefined;
    let specialFlag: boolean | undefined;
    try {
        const body = await req.json();
        if (body && typeof body.approve === 'boolean') approveFlag = body.approve;
        if (body && typeof body.special === 'boolean') specialFlag = body.special;
    } catch { /* empty body = legacy approve=true */ }

    if (approveFlag === undefined && specialFlag === undefined) {
        approveFlag = true;
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user || user.role !== 'family') {
        return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });
    }

    const wasApproved = user.familyApproved;
    const data: { familyApproved?: boolean; familySpecial?: boolean } = {};
    if (approveFlag !== undefined) data.familyApproved = approveFlag;
    if (specialFlag !== undefined) data.familySpecial = specialFlag;

    await db.user.update({ where: { id }, data });

    // Email #6 on approval transition false → true (either via approve or special)
    const nowApproved = data.familyApproved ?? user.familyApproved;
    const becomesSpecial = data.familySpecial === true && !user.familySpecial;
    if ((nowApproved && !wasApproved) || becomesSpecial) {
        sendFamilyRegistrationApprovedEmail(user.email, user.firstName).catch(console.error);
    }

    return NextResponse.json({ ok: true });
}

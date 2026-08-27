import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendFamilyRegistrationApprovedEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authError = await requireAdmin();
    if (authError) return authError;
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

    const nowApproved = data.familyApproved ?? user.familyApproved;
    const becomesSpecial = data.familySpecial === true && !user.familySpecial;
    if ((nowApproved && !wasApproved) || becomesSpecial) {
        const shopConfig = await db.shopConfig.findFirst();
        const openingDate = shopConfig?.openDate
            ? shopConfig.openDate.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Zurich' })
            : 'demnächst';
        sendFamilyRegistrationApprovedEmail(
            user.email,
            user.firstName,
            undefined,
            openingDate,
        ).catch(console.error);
    }

    return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

// PATCH /api/admin/families/[id]/contacted  { contacted: boolean }
// Toggles the "already contacted" marker used in the family-approval workflow,
// so the admin team can see at a glance who has already been reached out to.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;

    let contacted = true;
    try {
        const body = await req.json();
        if (body && typeof body.contacted === 'boolean') contacted = body.contacted;
    } catch { /* empty body = mark contacted */ }

    const user = await db.user.findUnique({ where: { id } });
    if (!user || user.role !== 'family') {
        return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });
    }

    const updated = await db.user.update({
        where: { id },
        data:  { contactedAt: contacted ? new Date() : null },
    });

    return NextResponse.json({ ok: true, contactedAt: updated.contactedAt });
}

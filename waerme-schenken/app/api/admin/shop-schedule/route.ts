import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { openDate, closeDate } = await req.json();
    const open  = openDate  ? new Date(openDate)  : null;
    const close = closeDate ? new Date(closeDate) : null;

    if (open && close && open >= close) {
        return NextResponse.json({ error: 'Das Öffnungsdatum muss vor dem Schliessdatum liegen.' }, { status: 400 });
    }

    const existing = await db.shopConfig.findFirst();
    if (existing) {
        const updated = await db.shopConfig.update({
            where: { id: existing.id },
            data:  { openDate: open, closeDate: close },
        });
        return NextResponse.json(updated);
    }
    const created = await db.shopConfig.create({ data: { openDate: open, closeDate: close } });
    return NextResponse.json(created);
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

export async function PATCH(req: NextRequest) {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

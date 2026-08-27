import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { formatZurichDate } from '@/lib/date';

export async function GET(req: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const format = searchParams.get('format') || 'json';

    const users = await db.user.findMany({
        where: filter === 'newsletter' ? { newsletterConsent: true } : undefined,
        select: {
            id:                true,
            firstName:         true,
            lastName:          true,
            email:             true,
            zipCode:           true,
            newsletterConsent: true,
            createdAt:         true,
        },
        orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
        const sanitize = (val: string) => {
            let s = val.replace(/"/g, '""');
            if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
            return `"${s}"`;
        };
        const header = 'Vorname,Nachname,E-Mail,PLZ/Ort,Newsletter,Registriert am';
        const rows = users.map((u: any) =>
            [
                sanitize(u.firstName),
                sanitize(u.lastName),
                sanitize(u.email),
                sanitize(u.zipCode || ''),
                u.newsletterConsent ? 'Ja' : 'Nein',
                formatZurichDate(u.createdAt),
            ].join(',')
        );
        const csv = [header, ...rows].join('\r\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="nutzer-${filter}-${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        });
    }

    return NextResponse.json(users);
}

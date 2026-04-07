import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

function requireAdmin(cookieStore: Awaited<ReturnType<typeof cookies>>) {
    if (!cookieStore.has('ws_admin_session')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

/** GET /api/admin/users
 *  Query params:
 *    filter = 'all' | 'newsletter'   (default: 'all')
 *    format = 'json' | 'csv'         (default: 'json')
 */
export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const authError = requireAdmin(cookieStore);
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
            newsletterConsent: true,
            createdAt:         true,
        },
        orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
        const header = 'Vorname,Nachname,E-Mail,Newsletter,Registriert am';
        const rows = users.map((u: any) =>
            [
                `"${u.firstName}"`,
                `"${u.lastName}"`,
                `"${u.email}"`,
                u.newsletterConsent ? 'Ja' : 'Nein',
                new Date(u.createdAt).toLocaleDateString('de-CH'),
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

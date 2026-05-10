export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { AdminHeader } from '@/app/admin/components/AdminHeader';
import { OrgManager } from './OrgManager';

export default async function AdminOrgsPage() {
    const orgs = await (db as any).socialCardOrg.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return (
        <>
            <AdminHeader />
            <main className="max-w-2xl mx-auto p-6 md:p-10 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Organisationen
                    </h2>
                    <p className="text-sm opacity-60 leading-relaxed max-w-xl">
                        Verwalte die Organisationen, die Sozialausweise ausstellen. Diese erscheinen als Auswahloptionen bei der Familienregistrierung.
                    </p>
                </div>
                <OrgManager orgs={orgs.map((o: any) => ({ id: o.id, name: o.name }))} />
            </main>
        </>
    );
}

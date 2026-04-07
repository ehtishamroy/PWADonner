import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { BRAND } from '@/lib/constants';
import { UsersClientPage } from './UsersClientPage';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>;
}) {
    const params = await searchParams;
    const filter = params.filter === 'newsletter' ? 'newsletter' : 'all';

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

    const totalAll        = await db.user.count();
    const totalNewsletter = await db.user.count({ where: { newsletterConsent: true } });

    return (
        <>
            <AdminHeader />
            <main className="max-w-5xl mx-auto p-6 md:p-10">
                <UsersClientPage
                    users={users as any}
                    filter={filter}
                    totalAll={totalAll}
                    totalNewsletter={totalNewsletter}
                />
            </main>
        </>
    );
}

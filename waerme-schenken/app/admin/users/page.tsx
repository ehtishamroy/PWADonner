import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { BRAND } from '@/lib/constants';
import { UsersClientPage } from './UsersClientPage';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string; page?: string }>;
}) {
    const params = await searchParams;
    const filter = params.filter === 'newsletter' ? 'newsletter' : 'all';
    const page   = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
    const where  = filter === 'newsletter' ? { newsletterConsent: true } : undefined;

    const [users, totalAll, totalNewsletter, totalFiltered] = await Promise.all([
        db.user.findMany({
            where,
            select: {
                id:                true,
                firstName:         true,
                lastName:          true,
                email:             true,
                role:              true,
                newsletterConsent: true,
                createdAt:         true,
            },
            orderBy: { createdAt: 'desc' },
            skip:  (page - 1) * PAGE_SIZE,
            take:  PAGE_SIZE,
        }),
        db.user.count(),
        db.user.count({ where: { newsletterConsent: true } }),
        db.user.count({ where }),
    ]);

    return (
        <>
            <AdminHeader />
            <main className="max-w-5xl mx-auto p-6 md:p-10">
                <UsersClientPage
                    users={users as any}
                    filter={filter}
                    page={page}
                    totalAll={totalAll}
                    totalNewsletter={totalNewsletter}
                    totalFiltered={totalFiltered}
                    pageSize={PAGE_SIZE}
                />
            </main>
        </>
    );
}

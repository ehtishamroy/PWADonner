import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { BannerForm } from './BannerForm';

export const dynamic = 'force-dynamic';

export default async function AdminBannerPage() {
    const banner = await db.newsBanner.findFirst({ orderBy: { createdAt: 'desc' } });

    return (
        <>
            <AdminHeader />
            <main className="max-w-3xl mx-auto p-6 md:p-10">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    News Banner
                </h2>
                <p className="opacity-60 mb-8">
                    Der Banner erscheint auf den Dashboards von Spender*innen und Familien.
                </p>
                <BannerForm
                    initial={banner ? {
                        id: banner.id,
                        title: banner.title,
                        body: banner.body,
                        isActive: banner.isActive,
                    } : null}
                />
            </main>
        </>
    );
}

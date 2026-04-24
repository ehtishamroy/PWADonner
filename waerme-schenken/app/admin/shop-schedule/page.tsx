import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { ScheduleForm } from './ScheduleForm';

export const dynamic = 'force-dynamic';

function toLocalInput(d: Date | null | undefined): string {
    if (!d) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminShopSchedulePage() {
    const shop = await db.shopConfig.findFirst();
    const now = new Date();
    const isOpen = shop?.openDate && shop?.closeDate
        ? now >= shop.openDate && now <= shop.closeDate
        : false;

    return (
        <>
            <AdminHeader />
            <main className="max-w-3xl mx-auto p-6 md:p-10">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    Börse öffnen / schliessen
                </h2>
                <p className="opacity-60 mb-8">
                    Status aktuell: <strong>{isOpen ? 'OFFEN' : 'GESCHLOSSEN'}</strong>
                </p>
                <ScheduleForm
                    openDate={toLocalInput(shop?.openDate)}
                    closeDate={toLocalInput(shop?.closeDate)}
                />
            </main>
        </>
    );
}

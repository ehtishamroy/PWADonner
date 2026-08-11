import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { DonationScheduleForm } from './DonationScheduleForm';

export const dynamic = 'force-dynamic';

function toLocalInput(d: Date | null | undefined): string {
    if (!d) return '';
    // Use Europe/Zurich to ensure correct local time formatting regardless of server timezone
    const str = d.toLocaleString('sv-SE', { timeZone: 'Europe/Zurich' });
    // sv-SE produces "YYYY-MM-DD HH:mm:ss", so we replace space with T and slice to HH:mm
    return str.replace(' ', 'T').slice(0, 16);
}

export default async function AdminDonationSchedulePage() {
    const shop = await db.shopConfig.findFirst();
    const now = new Date();
    const isOpen = shop?.donationOpenDate && shop?.donationCloseDate
        ? now >= shop.donationOpenDate && now <= shop.donationCloseDate
        : false;

    return (
        <>
            <AdminHeader />
            <main className="max-w-3xl mx-auto p-6 md:p-10">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    Spendenformular öffnen / schliessen
                </h2>
                <p className="opacity-60 mb-8">
                    Status aktuell: <strong>{isOpen ? 'OFFEN' : 'GESCHLOSSEN'}</strong>
                </p>
                <DonationScheduleForm
                    openDate={toLocalInput(shop?.donationOpenDate)}
                    closeDate={toLocalInput(shop?.donationCloseDate)}
                    isOpen={isOpen}
                />
            </main>
        </>
    );
}

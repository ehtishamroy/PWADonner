import { db } from '@/lib/db';
import DonateForm from './DonateForm';
import { BRAND } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function DonorDonatePage() {
    const config = await db.shopConfig.findFirst();
    const now = new Date();
    
    const isOpen = config?.donationOpenDate && config?.donationCloseDate
        ? now >= config.donationOpenDate && now <= config.donationCloseDate
        : true; // Default to open if no schedule is set

    if (!isOpen) {
        return (
            <div className="min-h-screen pt-12 px-5 pb-28 flex flex-col items-center justify-center" style={{ backgroundColor: BRAND.beige }}>
                <div className="max-w-md w-full bg-white rounded-[8px] p-8 text-center">
                    <h1 className="mb-4 text-2xl font-bold" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Spendenformular geschlossen
                    </h1>
                    <p className="opacity-80 mb-6 text-sm">
                        Das Spendenformular ist aktuell geschlossen. Wir nehmen momentan keine neuen Spielzeugspenden an.
                    </p>
                    {config?.donationOpenDate && now < config.donationOpenDate && (
                        <p className="opacity-80 font-bold text-sm">
                            Das Formular öffnet am: <br/>
                            {config.donationOpenDate.toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' })} Uhr
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return <DonateForm />;
}

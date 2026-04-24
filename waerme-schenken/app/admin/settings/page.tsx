import Link from 'next/link';
import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { BRAND } from '@/lib/constants';
import { SettingsToggle } from './SettingsToggle';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    const settings = await db.appSettings.upsert({
        where:  { id: 'singleton' },
        create: { id: 'singleton', familyApprovalRequired: true },
        update: {},
    });

    return (
        <>
            <AdminHeader />
            <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    Einstellungen
                </h2>

                {/* Family approval toggle */}
                <div className="bg-white rounded-[8px] p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Familienfreigabe
                    </h3>
                    <p className="text-sm opacity-60 mb-6 leading-relaxed max-w-xl">
                        Wenn aktiviert, müssen neu registrierte Familien von dir freigegeben werden, bevor sie auf die Spielzeugbörse zugreifen können. Wenn deaktiviert, können Familien nach der Registrierung direkt stöbern.
                    </p>
                    <SettingsToggle initial={settings.familyApprovalRequired} />
                </div>

                {/* Quick links */}
                <div className="bg-white rounded-[8px] p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Weitere Einstellungen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { href: '/admin/settings/images', label: 'Statische Bilder' },
                            { href: '/admin/categories',      label: 'Kategoriebilder' },
                            { href: '/admin/banner',          label: 'News Banner' },
                            { href: '/admin/shop-schedule',   label: 'Börse öffnen/schliessen' },
                        ].map(l => (
                            <Link key={l.href} href={l.href}
                                className="block p-4 rounded-[8px] border border-gray-100 hover:bg-gray-50 font-bold text-sm"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif", color: BRAND.green }}>
                                {l.label} →
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}

import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { BRAND } from '@/lib/constants';
import Link from 'next/link';
import { FamilyRow } from './FamilyRow';

export const dynamic = 'force-dynamic';

const VALID_TABS = ['waiting', 'approved', 'special'] as const;
type FamTab = typeof VALID_TABS[number];

export default async function AdminFamiliesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const params = await searchParams;
    const tab: FamTab = (VALID_TABS as readonly string[]).includes(params.tab ?? '')
        ? (params.tab as FamTab)
        : 'waiting';

    const whereClause =
        tab === 'approved' ? { role: 'family', familyApproved: true,  familySpecial: false }
      : tab === 'special'  ? { role: 'family', familySpecial: true }
      :                      { role: 'family', familyApproved: false, familySpecial: false };

    const [families, waitingCount, approvedCount, specialCount] = await Promise.all([
        db.user.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
        }),
        db.user.count({ where: { role: 'family', familyApproved: false, familySpecial: false } }),
        db.user.count({ where: { role: 'family', familyApproved: true,  familySpecial: false } }),
        db.user.count({ where: { role: 'family', familySpecial: true } }),
    ]);

    return (
        <>
            <AdminHeader />
            <main className="max-w-5xl mx-auto p-6 md:p-10">
                <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Familienfreigabe
                </h2>

                <div className="flex gap-4 border-b border-gray-200 pb-px mb-8">
                    {[
                        { key: 'waiting',  label: `Wartend (${waitingCount})` },
                        { key: 'approved', label: `Freigegeben (${approvedCount})` },
                        { key: 'special',  label: `Spezial (${specialCount})` },
                    ].map(t => (
                        <Link key={t.key} href={`/admin/families?tab=${t.key}`}
                            className="pb-3 font-bold uppercase tracking-widest text-sm border-b-2"
                            style={{
                                fontFamily: "'Bricolage Grotesque', sans-serif",
                                borderColor: tab === t.key ? BRAND.green : 'transparent',
                                color:       tab === t.key ? BRAND.green : undefined,
                                opacity:     tab === t.key ? 1 : 0.4,
                            }}>
                            {t.label}
                        </Link>
                    ))}
                </div>

                {families.length === 0 ? (
                    <div className="bg-white rounded-[8px] p-12 text-center shadow-sm">
                        <p className="opacity-60">Keine {tab === 'waiting' ? 'wartenden' : tab === 'approved' ? 'freigegebenen' : 'speziellen'} Familien.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {families.map(f => (
                            <FamilyRow key={f.id} family={{
                                id:        f.id,
                                firstName: f.firstName,
                                lastName:  f.lastName,
                                email:     f.email,
                                street:    f.street,
                                city:      f.city,
                                zipCode:   f.zipCode,
                                socialCardUrl: f.socialCardUrl,
                                socialCardOrg: f.socialCardOrg,
                                familyApproved: f.familyApproved,
                                familySpecial:  (f as { familySpecial?: boolean }).familySpecial ?? false,
                                createdAt: f.createdAt.toISOString(),
                            }} />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

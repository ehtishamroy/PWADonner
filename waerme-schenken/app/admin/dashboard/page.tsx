import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { BRAND, CONDITION_LABELS } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const VALID_TABS = ['waiting', 'approved', 'rejected'] as const;
type Tab = typeof VALID_TABS[number];

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const params = await searchParams;
    const tab: Tab = (VALID_TABS as readonly string[]).includes(params.tab ?? '')
        ? (params.tab as Tab)
        : 'waiting';

    // Oldest first for all tabs per spec 7.1
    const donations = await db.donation.findMany({
        where: { status: tab },
        orderBy: { createdAt: 'asc' },
        include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            donor: { select: { firstName: true, lastName: true, email: true } }
        },
    });

    const tabLabels: Record<Tab, string> = {
        waiting:  'Ausstehend',
        approved: 'Freigeschaltet',
        rejected: 'Abgelehnt',
    };

    return (
        <>
            <AdminHeader />
            <main className="max-w-5xl mx-auto p-6 md:p-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Spendenfreigabe
                    </h2>
                    
                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-gray-200 pb-px">
                        {VALID_TABS.map(t => (
                            <Link key={t}
                                href={`/admin/dashboard?tab=${t}`}
                                className={`pb-3 font-bold uppercase tracking-widest text-sm transition-colors border-b-2 ${tab === t ? '' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                style={{
                                    fontFamily: "'Bricolage Grotesque', sans-serif",
                                    borderColor: tab === t ? BRAND.green : undefined,
                                    color:       tab === t ? BRAND.green : undefined,
                                }}>
                                {tabLabels[t]}
                            </Link>
                        ))}
                    </div>
                </div>

                {donations.length === 0 ? (
                    <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-gray-100 mt-8">
                        <div className="text-4xl mb-4 opacity-50">{tab === 'waiting' ? '🎉' : tab === 'approved' ? '📦' : '🗑️'}</div>
                        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            {tab === 'waiting' ? 'Alles erledigt!' : tab === 'approved' ? 'Keine freigeschalteten Spenden' : 'Keine abgelehnten Spenden'}
                        </h3>
                        <p className="opacity-60">
                            {tab === 'waiting'
                                ? 'Keine neuen Spenden müssen überprüft werden.'
                                : tab === 'approved'
                                ? 'Sobald du Spenden freischaltest, erscheinen sie hier.'
                                : 'Abgelehnte Spenden erscheinen hier.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {donations.map((donation: any) => (
                            <Link 
                                href={`/admin/review/${donation.id}`} 
                                key={donation.id}
                                className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-gray-50 mb-4">
                                    {donation.images[0] ? (
                                        <Image
                                            src={donation.images[0].imageUrl}
                                            alt={donation.toyName}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 text-sm">
                                            Kein Bild
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                        style={{ color: tab === 'approved' ? BRAND.green : tab === 'rejected' ? BRAND.error : undefined }}>
                                        {tabLabels[tab]}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-1 leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                        {donation.toyName}
                                    </h3>
                                    <p className="text-xs font-medium opacity-60 mb-3">
                                        Von: {donation.donor.firstName} {donation.donor.lastName}
                                    </p>
                                    
                                    <div className="mt-auto flex flex-wrap gap-2">
                                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-md">
                                            {donation.category}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-md">
                                            {CONDITION_LABELS[donation.condition] || donation.condition}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

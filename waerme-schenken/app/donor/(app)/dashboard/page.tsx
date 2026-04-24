import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { de } from '@/lib/i18n/de';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ZebraCat, Gift, Duck } from '@/components/brand/Illustrations';
import Link from 'next/link';
import { BRAND, STATUS_COLORS } from '@/lib/constants';
import { Box, Plus } from 'lucide-react';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Suspense } from 'react';

export default async function DonorDashboardPage() {
    const session = await getSession();
    if (!session) redirect('/api/auth/clear-session');

    const [user, donations, banner, myStatusCounts, globalApprovedCount, globalSelectedCount] = await Promise.all([
        db.user.findUnique({ where: { id: session.userId } }),
        db.donation.findMany({
            where:   { donorId: session.userId },
            include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
            orderBy: { createdAt: 'desc' },
        }),
        db.newsBanner.findFirst({ where: { isActive: true } }),
        db.donation.groupBy({
            by: ['status'],
            where: { donorId: session.userId },
            _count: true,
        }),
        db.donation.count({ where: { status: 'approved' } }),
        db.donation.count({ where: { status: 'selected' } }),
    ]);

    const myCounts = Object.fromEntries(myStatusCounts.map(s => [s.status, s._count])) as Record<string, number>;
    const waitingCount  = myCounts.waiting  || 0;
    const approvedCount = myCounts.approved || 0;
    const selectedCount = myCounts.selected || 0;
    const sentCount     = myCounts.sent     || 0;

    if (!user) redirect('/api/auth/clear-session');

    return (
        <div className="min-h-screen pt-8 px-5 pb-28 md:pb-10 md:px-10 md:pt-10" style={{ backgroundColor: BRAND.beige }}>
            <Suspense fallback={null}>
                <SuccessToast message="Danke! Deine Spende wurde eingereicht." />
            </Suspense>
            <div className="max-w-4xl mx-auto">

            {/* NEWS */}
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="font-bold text-[#000000]"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                    {de.dashboard.news}
                </h2>
                <div className="-mt-2">
                    <ZebraCat width={60} height={60} />
                </div>
            </div>

            <div className="bg-white rounded-[8px] p-7 shadow-sm mb-10">
                <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {banner?.title || 'Wärme schenken'}
                </h1>
                <p className="mt-2 opacity-75" style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', lineHeight: '20px' }}>
                    {banner?.body || 'Herzlich willkommen!'}
                </p>
            </div>

            {/* PERSONAL STATUS SUMMARY */}
            {donations.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {[
                        { label: 'Wartend',        count: waitingCount,  color: STATUS_COLORS.waiting  },
                        { label: 'Freigegeben',    count: approvedCount, color: STATUS_COLORS.approved },
                        { label: 'Ausgewählt',     count: selectedCount, color: STATUS_COLORS.selected },
                        { label: 'Verschickt',     count: sentCount,     color: STATUS_COLORS.sent     },
                    ].map(s => (
                        <div key={s.label} className="rounded-[8px] p-3 text-center shadow-sm"
                            style={{ backgroundColor: s.color }}>
                            <p className="text-[24px] font-bold leading-none"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{s.count}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* DONATION OVERVIEW */}
            <h2 className="font-medium text-[#000000] mb-5 px-1"
                style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                {de.dashboard.donationOverview}
            </h2>

            {donations.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px' }}>{de.dashboard.empty}</p>
                    <Link href="/donor/donate"
                        className="h-10 min-w-[143px] px-6 rounded-full text-white text-[13px] font-bold flex items-center justify-center mx-auto mt-4 transition-transform active:scale-95 shadow-sm"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {de.dashboard.addFirst}
                    </Link>
                </div>
            ) : (
                <div className="space-y-5 mb-10">
                    {donations.map((d: (typeof donations)[number]) => {
                        const bg      = STATUS_COLORS[d.status] || '#D1D5DB';
                        const imgUrl  = d.images[0]?.imageUrl;
                        return (
                            <Link key={d.id} href={`/donor/donation/${d.id}`} className="block">
                                <div className="rounded-[8px] p-5 flex gap-5 min-h-[150px] relative hover:scale-[1.01] transition-transform shadow-sm"
                                    style={{ backgroundColor: bg }}>
                                    {/* Thumbnail — framed design with inner shadow */}
                                    <div className="w-[110px] h-[110px] bg-white rounded-[18px] p-1.5 shrink-0 overflow-hidden shadow-inner">
                                        {imgUrl
                                            ? <img src={imgUrl} alt={d.toyName} className="w-full h-full object-cover rounded-[14px]" />
                                            : <div className="w-full h-full bg-gray-100 rounded-[14px]" />
                                        }
                                    </div>
                                    {/* Info */}
                                    <div className="flex flex-col justify-between py-1 flex-grow">
                                        <div>
                                            <h3 className="font-bold text-[17px] leading-[1.2] mb-1 line-clamp-2 text-[#000000]"
                                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                                {d.toyName}
                                            </h3>
                                            <p className="text-[13px] leading-[1.4] opacity-90 text-[#000000]">
                                                {d.ageRange} · {d.category}
                                            </p>
                                        </div>
                                        <StatusBadge status={d.status} className="self-start mt-1" />
                                    </div>
                                    {/* Ship button for selected */}
                                    {d.status === 'selected' && (
                                        <div className="absolute bottom-4 right-4">
                                            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-white">
                                                <Box size={20} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* FACTS */}
            <h2 className="font-medium text-[#000000] mb-5 px-1"
                style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                {de.dashboard.facts}
            </h2>
            <div className="rounded-[32px] p-9 pt-12 relative overflow-visible mb-4"
                style={{ backgroundColor: BRAND.greenDark }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
                    <Gift width={90} height={80} />
                </div>
                <div className="absolute -bottom-6 -left-2 z-10">
                    <Duck width={66} height={58} />
                </div>
                <div className="grid grid-cols-2 gap-6 text-white relative">
                    <div className="text-center">
                        <p className="text-[40px] font-bold leading-none mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {globalApprovedCount.toLocaleString('de-CH')}
                        </p>
                        <p className="text-[12px] opacity-80 mx-auto max-w-[120px]">{de.dashboard.factsCount}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[40px] font-bold leading-none mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {globalSelectedCount.toLocaleString('de-CH')}
                        </p>
                        <p className="text-[12px] opacity-80 mx-auto max-w-[120px]">{de.dashboard.factsSelected}</p>
                    </div>
                </div>
            </div>

            </div> {/* max-w container */}

            {/* Floating + button */}
            {donations.length > 0 && (
                <Link href="/donor/donate"
                    aria-label="Neue Spende hinzufügen"
                    className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform z-40"
                    style={{ backgroundColor: BRAND.green }}>
                    <Plus size={28} strokeWidth={2.5} />
                </Link>
            )}
        </div>
    );
}

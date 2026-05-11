import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { BRAND, STATUS_COLORS } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { de } from '@/lib/i18n/de';
import { Package } from 'lucide-react';
import { ZebraCat } from '@/components/brand/Illustrations';
import { OrderedBanner } from './OrderedBanner';

const MAX_TOYS = 5;

export default async function FamilyDashboardPage() {
    const session = await getSession();
    if (!session) redirect('/family/login');
    if (session.role && session.role !== 'family') redirect('/donor/dashboard');

    const [user, selections, shop, banner] = await Promise.all([
        db.user.findUnique({ where: { id: session.userId } }),
        db.donation.findMany({
            where: { selectedByFamilyId: session.userId, status: { in: ['selected', 'sent'] } },
            include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
            orderBy: { selectedAt: 'desc' },
        }),
        db.shopConfig.findFirst(),
        db.newsBanner.findFirst({ where: { isActive: true } }),
    ]);

    if (!user) redirect('/family/login');

    const now = new Date();
    const isOpen = shop?.openDate && shop?.closeDate
        ? now >= shop.openDate && now <= shop.closeDate
        : true;
    const atLimit = selections.length >= MAX_TOYS;
    const sentCount = selections.filter(s => s.status === 'sent').length;

    return (
        <div className="min-h-screen pt-8 px-5 pb-28 md:pb-10 md:px-10 md:pt-10" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-4xl mx-auto">

                {/* Post-checkout success banner */}
                <Suspense fallback={null}>
                    <OrderedBanner />
                </Suspense>

                {/* NEWS */}
                <div className="flex justify-between items-center mb-0 px-1">
                    <h3 className="font-medium text-[#000000] uppercase"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                        {de.dashboard.news}
                    </h3>
                    <div style={{ position: 'relative', top: 43, left: -2 }}>
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

                {/* Shop state */}
                {!isOpen && shop?.openDate && (
                    <div className="bg-white rounded-[8px] p-6 shadow-sm mb-8 text-center">
                        <p className="opacity-80">
                            {de.family.shop.shopOpensOn}{' '}
                            <strong>{shop.openDate.toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                        </p>
                    </div>
                )}

                {isOpen && atLimit && (
                    <div className="bg-white rounded-[8px] p-6 shadow-sm mb-8 text-center">
                        <p className="font-bold text-[16px]">{de.family.dashboard.presentsOnWay}</p>
                    </div>
                )}

                {isOpen && !atLimit && (
                    <div className="mb-8">
                        <Link href="/family/shop"
                            className="inline-flex h-10 px-6 rounded-full text-white shadow-lg"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '0.15em' }}>
                            <span className="flex items-center">ZUR SPIELZEUGBÖRSE</span>
                        </Link>
                    </div>
                )}

                {/* Stats */}
                {selections.length > 0 && (
                    <div className="flex gap-3 mb-6">
                        <div className="flex-1 rounded-[8px] p-4 flex flex-col items-center justify-center shadow-sm"
                            style={{ backgroundColor: BRAND.lila }}>
                            <span className="text-[32px] font-bold leading-none mb-1"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {selections.length}&nbsp;<span className="text-[18px] opacity-60">/ {MAX_TOYS}</span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {de.family.dashboard.statsSelected}
                            </span>
                        </div>
                        <div className="flex-1 rounded-[8px] p-4 flex flex-col items-center justify-center shadow-sm"
                            style={{ backgroundColor: BRAND.greenBright }}>
                            <span className="text-[32px] font-bold leading-none mb-1"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {sentCount}&nbsp;<span className="text-[18px] opacity-60">/ {selections.length}</span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80"
                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                {de.family.dashboard.statsOnWay}
                            </span>
                        </div>
                    </div>
                )}

                {/* Selected toys */}
                <h3 className="font-medium text-[#000000] mb-4 px-1 uppercase"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                    {de.family.dashboard.yourPresents}
                </h3>

                {selections.length === 0 ? (
                    <div className="bg-white rounded-[8px] p-6 shadow-sm text-center opacity-60">
                        Noch keine Spielzeuge ausgewählt.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selections.map(d => {
                            const bg = STATUS_COLORS[d.status] || '#D1D5DB';
                            const thumb = d.images[0]?.imageUrl;
                            return (
                                <Link key={d.id} href={`/family/selections/${d.id}`}
                                    className="rounded-[8px] p-4 flex gap-4 shadow-sm active:scale-[0.98] transition-transform block relative"
                                    style={{ backgroundColor: bg }}>
                                    <div className="w-20 h-20 bg-white rounded-[8px] overflow-hidden shrink-0">
                                        {thumb
                                            ? <img src={thumb} alt={d.toyName} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center"><Package size={28} className="opacity-40" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col items-start">
                                        <h3 className="font-bold text-[16px] leading-tight mb-1 line-clamp-2"
                                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                            {d.toyName}
                                        </h3>
                                        <p className="text-[12px] mb-2 opacity-80">{d.ageRange} · {d.category}</p>
                                        <StatusBadge status={d.status} />
                                        {d.trackingNumber && (
                                            <p className="text-[11px] opacity-70 mt-1.5 font-mono">#{d.trackingNumber}</p>
                                        )}
                                    </div>
                                    {d.status === 'selected' && (
                                        <div className="absolute bottom-4 right-4">
                                            <img src="/images/icon-selected-action.png" alt="" width={35} height={35} className="object-contain" />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}

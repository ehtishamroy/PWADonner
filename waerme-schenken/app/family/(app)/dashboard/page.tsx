import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { BRAND, STATUS_COLORS } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { de } from '@/lib/i18n/de';
import { Package, Truck } from 'lucide-react';
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
                        {banner?.title || 'Wärme Schenken'}
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
                                            <p className="text-[11px] opacity-70 mt-1.5 font-mono flex items-center gap-1">
                                                <svg fill="#ffffff" width="13" height="13" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M2.84375 13C1.273438 13 0 14.277344 0 15.84375L0 42C0 43.566406 1.429688 45 3 45L7.09375 45C7.570313 47.835938 10.03125 50 13 50C15.96875 50 18.429688 47.835938 18.90625 45L28.15625 45C29.722656 45 31 43.722656 31 42.15625L31 15.90625C31 14.304688 29.738281 13 28.1875 13 Z M 33 20L33 45C33.480469 47.832031 36.03125 50 39 50C41.96875 50 44.429688 47.832031 44.90625 45L47 45C48.570313 45 50 43.570313 50 42L50 32.375C50 30.363281 48.550781 28.308594 48.375 28.0625L44.21875 22.5C43.265625 21.351563 41.769531 20 40 20 Z M 38 25L43.59375 25L46.78125 29.25C47.121094 29.730469 48 31.203125 48 32.375L48 33L38 33C37 33 36 32 36 31L36 27C36 25.894531 37 25 38 25 Z M 13 40C15.207031 40 17 41.792969 17 44C17 46.207031 15.207031 48 13 48C10.792969 48 9 46.207031 9 44C9 41.792969 10.792969 40 13 40 Z M 39 40C41.207031 40 43 41.792969 43 44C43 46.207031 41.207031 48 39 48C36.792969 48 35 46.207031 35 44C35 41.792969 36.792969 40 39 40Z"/></svg>
                                                {d.trackingNumber}
                                            </p>
                                        )}
                                    </div>
                                    {d.status === 'selected' && (
                                        <div className="absolute bottom-4 right-4">
                                            <img src="/api/img/icon-selected-action" alt="" width={35} height={35} className="object-contain" />
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

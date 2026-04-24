import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { BRAND, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { Package } from 'lucide-react';

const MAX_TOYS = 5;

export default async function FamilyDashboardPage() {
    const session = await getSession();
    if (!session) redirect('/family/login');

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

    return (
        <div className="min-h-screen pt-8 px-5 pb-28 md:pb-10 md:px-10 md:pt-10" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-4xl mx-auto">

                {/* Greeting */}
                <h1 className="mb-6"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px' }}>
                    {de.family.dashboard.welcome} {user.firstName}
                </h1>

                {/* News banner */}
                {banner && (
                    <div className="rounded-[8px] p-6 shadow-sm mb-8"
                        style={{ backgroundColor: BRAND.lila }}>
                        <h2 className="font-bold mb-1"
                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                            {banner.title}
                        </h2>
                        <p className="text-[14px] opacity-80 leading-relaxed">{banner.body}</p>
                    </div>
                )}

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
                            <span className="flex items-center">{de.family.dashboard.shopMore.toUpperCase()}</span>
                        </Link>
                    </div>
                )}

                {/* Selected toys */}
                <h2 className="mb-4 font-medium"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '20px' }}>
                    {de.family.dashboard.yourPresents}
                </h2>

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
                                <div key={d.id} className="rounded-[8px] p-4 flex gap-4 shadow-sm"
                                    style={{ backgroundColor: bg }}>
                                    <div className="w-20 h-20 bg-white rounded-[8px] overflow-hidden shrink-0">
                                        {thumb
                                            ? <img src={thumb} alt={d.toyName} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center"><Package size={28} className="opacity-40" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[16px] leading-tight mb-1 line-clamp-2"
                                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                            {d.toyName}
                                        </h3>
                                        <p className="text-[12px] mb-2 opacity-80">{d.ageRange} · {d.category}</p>
                                        <span className="text-[11px] font-bold uppercase tracking-widest"
                                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                            {STATUS_LABELS[d.status] || d.status}
                                        </span>
                                        {d.trackingNumber && (
                                            <p className="text-[11px] opacity-70 mt-1 font-mono">#{d.trackingNumber}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}

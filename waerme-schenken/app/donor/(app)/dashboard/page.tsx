import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { de } from '@/lib/i18n/de';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ZebraCat, Gift, Duck } from '@/components/brand/Illustrations';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND, STATUS_COLORS } from '@/lib/constants';
import { Box } from 'lucide-react';

export default async function DonorDashboardPage() {
    const session = await getSession();
    if (!session) redirect('/donor/login');

    const [user, donations, banner, stats] = await Promise.all([
        db.user.findUnique({ where: { id: session.userId } }),
        db.donation.findMany({
            where:   { donorId: session.userId },
            include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
            orderBy: { createdAt: 'desc' },
        }),
        db.newsBanner.findFirst({ where: { isActive: true } }),
        db.donation.aggregate({ _count: { id: true } }),
    ]);

    if (!user) redirect('/donor/login');

    return (
        <div className="min-h-screen pt-8 px-5 pb-28 md:pb-10 md:px-10 md:pt-10" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-4xl mx-auto">

            {/* NEWS */}
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-[13px] font-bold tracking-[0.15em] opacity-70"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    {de.dashboard.news.toUpperCase()}
                </h2>
                <div className="-mt-2">
                    <ZebraCat width={60} height={60} />
                </div>
            </div>

            <div className="bg-white rounded-[28px] p-7 shadow-sm mb-10">
                <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {banner?.title || 'Wärme schenken'}
                </h1>
                <p className="mt-2 opacity-75" style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px', lineHeight: '20px' }}>
                    {banner?.body || 'Herzlich willkommen!'}
                </p>
            </div>

            {/* DONATION OVERVIEW */}
            <h2 className="text-[13px] font-bold tracking-[0.15em] opacity-70 mb-5 px-1"
                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                {de.dashboard.donationOverview.toUpperCase()}
            </h2>

            {donations.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '15px' }}>{de.dashboard.empty}</p>
                    <Link href="/donor/donate"
                        className="inline-block mt-4 px-8 py-3 rounded-full text-white text-sm font-bold"
                        style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {de.dashboard.addFirst}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4 mb-10">
                    {donations.map((d: (typeof donations)[number]) => {
                        const bg      = STATUS_COLORS[d.status] || '#D1D5DB';
                        const imgUrl  = d.images[0]?.imageUrl;
                        return (
                            <Link key={d.id} href={`/donor/donation/${d.id}`}>
                                <div className="rounded-[24px] p-4 pr-5 flex gap-4 min-h-[130px] relative hover:scale-[1.01] transition-transform"
                                    style={{ backgroundColor: bg }}>
                                    {/* Thumbnail */}
                                    <div className="w-[100px] h-[100px] bg-white rounded-[18px] overflow-hidden shrink-0">
                                        {imgUrl
                                            ? <Image src={imgUrl} alt={d.toyName} width={100} height={100} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-gray-100" />
                                        }
                                    </div>
                                    {/* Info */}
                                    <div className="flex flex-col justify-between py-1 flex-grow">
                                        <div>
                                            <h3 className="font-bold text-[16px] leading-tight mb-1 line-clamp-2"
                                                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                                {d.toyName}
                                            </h3>
                                            <p className="text-[12px] opacity-85">
                                                {d.ageRange} Jahre · {d.category}
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
            <h2 className="text-[13px] font-bold tracking-[0.15em] opacity-70 mb-5 px-1"
                style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                {de.dashboard.facts.toUpperCase()}
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
                            {stats._count.id.toLocaleString('de-CH')}
                        </p>
                        <p className="text-[12px] opacity-80 mx-auto max-w-[120px]">{de.dashboard.factsCount}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[40px] font-bold leading-none mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            5{`'`}020
                        </p>
                        <p className="text-[12px] opacity-80 mx-auto max-w-[120px]">{de.dashboard.factsMoney}</p>
                    </div>
                </div>
            </div>

            </div> {/* max-w container */}
        </div>
    );
}

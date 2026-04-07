import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { de } from '@/lib/i18n/de';
import { ConditionBadge } from '@/components/ui/StatusBadge';
import { BRAND, CONDITION_LABELS, STATUS_COLORS } from '@/lib/constants';
import Link from 'next/link';
import { DonationActions } from './DonationActions';
import { ImageCarousel } from './ImageCarousel';

export default async function DonationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) redirect('/api/auth/clear-session');

    const donation = await db.donation.findUnique({
        where:   { id },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!donation || donation.donorId !== session.userId) notFound();

    // If selected, load family address
    let familyAddress: string | null = null;
    if (donation.status === 'selected' && donation.selectedByFamilyId) {
        const family = await db.user.findUnique({
            where: { id: donation.selectedByFamilyId },
        });
        // Family address is in families table — for now show what we have
        familyAddress = family ? `${family.firstName} ${family.lastName}` : null;
    }

    return (
        <div className="min-h-screen pb-24 flex flex-col items-center" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-xl w-full">
            {/* Header */}
            <div className="pt-10 px-5 flex items-center gap-3 mb-6">
                <Link href="/donor/dashboard"
                    className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                </Link>
                <span className="font-bold uppercase tracking-widest text-sm"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                    {de.common.back}
                </span>
            </div>

            {/* If selected — show "Who selected yours?" */}
            {donation.status === 'selected' && (
                <div className="px-5 mb-4">
                    <h2 className="font-bold tracking-widest uppercase text-sm mb-4"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {de.donationDetail.whoSelected}
                    </h2>
                    <div className="bg-white rounded-[24px] p-7 shadow-sm relative z-10 mb-[-40px]">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2"
                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            {de.donationDetail.address}
                        </p>
                        <p className="font-bold text-[16px] leading-snug mb-2">
                            {familyAddress || 'Familie wartet auf Bestätigung'}
                        </p>
                        <p className="text-[14px] opacity-70">{de.donationDetail.sendTo}</p>
                    </div>
                </div>
            )}

            {/* Content block — lila bg when selected */}
            <div
                className="mx-5 rounded-[8px] p-4 pt-14 relative"
                style={{ backgroundColor: STATUS_COLORS[donation.status] || 'transparent' }}
            >
                {/* Image carousel */}
                {donation.images.length > 0 ? (
                    <div className="relative rounded-[8px] overflow-hidden aspect-square max-h-[500px] mx-auto mb-4 shadow-md"
                        style={{ backgroundColor: 'white' }}>
                        <ConditionBadge condition={donation.condition} className="absolute top-4 left-4 z-30" />
                        <ImageCarousel images={donation.images} altBase={donation.toyName} />
                    </div>
                ) : (
                    <div className="rounded-[22px] aspect-square bg-gray-100 mb-4 flex items-center justify-center">
                        <span className="opacity-30 text-sm">Kein Foto</span>
                    </div>
                )}

                {/* Details */}
                <div className={donation.status === 'selected' ? 'px-2' : 'px-1'}>
                    <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '24px', lineHeight: '28px' }}>
                        {donation.toyName}
                    </h1>
                    <p className="text-[13px] font-medium mt-1 leading-tight opacity-80">
                        {donation.ageRange} · {donation.category} · {CONDITION_LABELS[donation.condition] || donation.condition}
                    </p>
                    <p className="mt-4 text-[14px] leading-relaxed opacity-90">{donation.description}</p>
                </div>
            </div>

            {/* Actions — includes delete button */}
            <DonationActions
                donationId={donation.id}
                status={donation.status}
            />

            </div>
        </div>
    );
}

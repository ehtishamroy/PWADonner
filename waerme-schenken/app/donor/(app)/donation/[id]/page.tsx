import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { de } from '@/lib/i18n/de';
import { ConditionBadge } from '@/components/ui/StatusBadge';
import { BRAND, CONDITION_LABELS, STATUS_COLORS } from '@/lib/constants';
import Link from 'next/link';
import { DonationActions } from './DonationActions';
import { DonationSendCard } from './DonationSendCard';
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

    // If selected, load family recipient details (full address)
    let family: { firstName: string; lastName: string; street: string | null; zipCode: string | null; city: string | null } | null = null;
    if (donation.status === 'selected' && donation.selectedByFamilyId) {
        family = await db.user.findUnique({
            where: { id: donation.selectedByFamilyId },
            select: { firstName: true, lastName: true, street: true, zipCode: true, city: true },
        });
    }

    return (
        <div className="min-h-screen pb-24 flex flex-col items-center" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-xl w-full">
            {/* Header */}
            <div className="pt-10 px-5 mb-6">
                <Link href="/donor/dashboard"
                    className="inline-flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-sm"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {donation.status === 'selected'
                            ? de.donationDetail.whoSelected
                            : de.common.back}
                    </span>
                </Link>
            </div>

            {/* If selected — show address card with tracking input + SEND */}
            {donation.status === 'selected' && (
                <DonationSendCard donationId={donation.id} family={family} />
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
                trackingNumber={donation.trackingNumber}
            />

            </div>
        </div>
    );
}

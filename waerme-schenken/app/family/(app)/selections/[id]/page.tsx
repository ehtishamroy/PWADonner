import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, Mail } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { BRAND, STATUS_COLORS, STATUS_LABELS, CONDITION_LABELS, CONDITION_COLORS } from '@/lib/constants';

export default async function SelectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) redirect('/family/login');

    const donation = await db.donation.findUnique({
        where:   { id },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!donation || donation.selectedByFamilyId !== session.userId) notFound();

    const donor = donation.donorId
        ? await db.user.findUnique({
              where:  { id: donation.donorId },
              select: { email: true, emailShareConsent: true },
          })
        : null;

    const statusColor = STATUS_COLORS[donation.status] || '#D1D5DB';
    const statusLabel = STATUS_LABELS[donation.status] || donation.status;
    const condLabel   = CONDITION_LABELS[donation.condition] || donation.condition;
    const condColor   = CONDITION_COLORS[donation.condition] || BRAND.mustard;
    const thumb       = donation.images[0]?.imageUrl ?? null;

    return (
        <div className="min-h-screen pb-28 md:pb-10" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-2xl mx-auto">

                {/* Back */}
                <div className="pt-10 px-5 mb-6">
                    <Link href="/family/dashboard"
                        className="inline-flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12 5L7 10L12 15" stroke="#537D61" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                        <span className="font-bold uppercase tracking-widest text-sm"
                            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            Zurück
                        </span>
                    </Link>
                </div>

                {/* Image */}
                <div className="px-5 mb-6">
                    <div className="relative rounded-[8px] overflow-hidden aspect-square bg-white shadow-md flex items-center justify-center">
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[12px] font-medium z-10"
                            style={{ backgroundColor: condColor, opacity: 0.85 }}>
                            {condLabel}
                        </div>
                        {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt={donation.toyName} className="w-full h-full object-cover" />
                        ) : (
                            <Package size={120} className="opacity-30" />
                        )}
                    </div>

                    {/* Extra images row */}
                    {donation.images.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto">
                            {donation.images.map((img, i) => (
                                <div key={i} className="w-16 h-16 rounded-[8px] overflow-hidden shrink-0 bg-white shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="px-5 space-y-4">

                    {/* Status badge */}
                    <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest"
                        style={{ backgroundColor: statusColor, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {statusLabel}
                    </span>

                    {/* Title */}
                    <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '24px', lineHeight: '28px' }}>
                        {donation.toyName}
                    </h1>

                    {/* Meta */}
                    <p className="text-[14px] opacity-60">
                        {donation.category} · {donation.ageRange}
                    </p>

                    {/* Description */}
                    <p className="text-[14px] opacity-80 leading-relaxed">
                        {donation.description}
                    </p>

                    {/* Thank you button — only if donor opted in */}
                    {donor?.emailShareConsent && (
                        <a
                            href={`mailto:${donor.email}?subject=${encodeURIComponent('Vielen Dank für deine Spende!')}&body=${encodeURIComponent('Liebe*r Spender*in,\n\nHerzlichen Dank für das Spielzeug „' + donation.toyName + '". Wir freuen uns sehr darüber!\n\nLiebe Grüsse')}`}
                            className="flex items-center justify-center gap-2 w-full h-12 rounded-full font-bold text-[14px] uppercase tracking-widest text-white transition-opacity active:opacity-75"
                            style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                            <Mail size={17} />
                            Danke sagen
                        </a>
                    )}

                    {/* Tracking number */}
                    {donation.trackingNumber && (
                        <div className="flex items-center gap-3 rounded-[8px] p-4 shadow-sm"
                            style={{ backgroundColor: BRAND.greenBright }}>
                            <Truck size={18} className="shrink-0" />
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                                    Tracking-Nummer
                                </p>
                                <p className="font-mono text-[14px] font-bold">{donation.trackingNumber}</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

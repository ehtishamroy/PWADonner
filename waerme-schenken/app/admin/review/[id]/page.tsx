import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { AdminHeader } from '../../components/AdminHeader';
import { BRAND, CONDITION_LABELS } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import ReviewActions from './ReviewActions';
import { DonationImage } from '@prisma/client';

export default async function AdminReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const donation = await db.donation.findUnique({
        where: { id },
        include: { 
            images: { orderBy: { sortOrder: 'asc' } },
            donor: true 
        },
    });

    if (!donation) notFound();

    return (
        <>
            <AdminHeader />
            <main className="max-w-4xl mx-auto p-6 md:p-10">
                
                {/* Back button */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12 5L7 10L12 15" stroke={BRAND.green} strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </Link>
                    <span className="font-bold uppercase tracking-widest text-sm opacity-60" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Zurück zur Übersicht
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        {donation.images.length > 0 ? (
                            <>
                                <div className="relative w-full aspect-square rounded-[24px] overflow-hidden shadow-sm bg-gray-50">
                                    <Image
                                        src={donation.images[0].imageUrl}
                                        alt={donation.toyName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {donation.images.slice(1).map((img: DonationImage) => (
                                        <div key={img.id} className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-50">
                                            <Image src={img.imageUrl} alt="" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="w-full aspect-square rounded-[24px] bg-gray-100 flex items-center justify-center">
                                <span className="opacity-40">Keine Fotos hochgeladen</span>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div>
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8">
                            <h1 className="text-3xl font-bold leading-tight mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                {donation.toyName}
                            </h1>
                            <p className="text-sm font-medium opacity-60 mb-8">
                                Eingereicht am {new Date(donation.createdAt).toLocaleDateString('de-CH')}
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                        Spender
                                    </p>
                                    <p className="font-medium text-lg">{donation.donor.firstName} {donation.donor.lastName}</p>
                                    <p className="text-sm opacity-60">{donation.donor.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                            Kategorie
                                        </p>
                                        <p className="font-medium">{donation.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                            Alter
                                        </p>
                                        <p className="font-medium">{donation.ageRange} Jahre</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                            Zustand
                                        </p>
                                        <p className="font-medium">{CONDITION_LABELS[donation.condition] || donation.condition}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                        Beschreibung des Spenders
                                    </p>
                                    <div className="bg-gray-50 rounded-[16px] p-4 text-sm leading-relaxed opacity-80">
                                        {donation.description || 'Keine Beschreibung angegeben.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Component */}
                        <ReviewActions params={params} currentStatus={donation.status} />

                    </div>
                </div>
            </main>
        </>
    );
}

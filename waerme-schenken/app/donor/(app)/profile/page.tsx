import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';
import { User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function DonorProfilePage() {
    const session = await getSession();
    if (!session) redirect('/api/auth/clear-session');

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) redirect('/api/auth/clear-session');

    const accordionItems = [
        { label: de.profile.mailings, href: '/donor/profile/mailings' },
        { label: 'Statuten',          href: '/statuten' },
        { label: de.profile.privacy,  href: '/datenschutz' },
        { label: de.profile.about,    href: '/about' },
        { label: de.profile.deleteProfile, href: '/donor/profile/delete', danger: true },
    ];

    return (
        <div className="min-h-screen pt-12 px-5 pb-24" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md mx-auto">
                {/* Heading */}
                <h1 className="mb-8"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {de.profile.greeting} {user.firstName}
                </h1>

                {/* Details card */}
                <div className="bg-white rounded-[7px] p-7 shadow-sm mb-4 relative overflow-hidden">
                    <h3 className="mb-4"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px', fontWeight: 400, color: '#000', opacity: 1 }}>{de.profile.details}</h3>
                    <p className="font-bold text-[18px] mb-1">{user.firstName} {user.lastName}</p>
                    <p className="opacity-60 text-[15px]">{user.email}</p>
                    <User className="absolute -bottom-5 -right-5 w-28 h-28 opacity-[0.03]" />
                </div>

                {/* Address card */}
                <div className="bg-white rounded-[7px] p-7 shadow-sm mb-6 relative">
                    <h3 className="mb-4"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '15px', fontWeight: 400, color: '#000', opacity: 1 }}>{de.profile.address}</h3>
                    {user.zipCode ? (
                        <p className="font-bold text-[18px]">{user.zipCode}</p>
                    ) : (
                        <p className="opacity-50 text-[14px]">Noch keine Adresse</p>
                    )}
                    <p className="text-[13px] opacity-50 mt-3 max-w-[180px] leading-relaxed">{de.profile.addressHint}</p>
                    <Link
                        href="/donor/profile/edit-address"
                        className="absolute top-7 right-7 flex items-center justify-center">
                        <img src="/images/icon-profile-edit.png" alt="" width={35} height={35} className="object-contain" />
                    </Link>
                </div>

                {/* Accordion */}
                <div className="bg-white rounded-[7px] shadow-sm overflow-hidden divide-y divide-gray-200">
                    {accordionItems.map(({ label, href, danger }) => (
                        <Link key={label} href={href}
                            className="flex justify-between items-center px-7 py-5 hover:bg-gray-50 transition-colors group">
                            <span
                                style={{
                                    fontFamily: "'Bricolage Grotesque',sans-serif",
                                    fontWeight: 700,
                                    fontSize: '16px',
                                    color: danger ? BRAND.error : '#000',
                                    opacity: 1,
                                }}>
                                {label}
                            </span>
                            <ChevronRight size={20} className="opacity-40 group-hover:opacity-60 transition-opacity" />
                        </Link>
                    ))}
                </div>
            </div> {/* max-w-md */}
        </div>
    );
}


import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';
import { Edit2, User, ChevronRight } from 'lucide-react';

export default async function FamilyProfilePage() {
    const session = await getSession();
    if (!session) redirect('/family/login');

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) redirect('/family/login');

    const accordionItems = [
        { label: de.profile.mailings,      href: '/family/profile/mailings' },
        { label: 'Statuten',                href: '/statuten' },
        { label: de.profile.privacy,       href: '/datenschutz' },
        { label: de.profile.about,         href: '/about' },
        { label: de.profile.deleteProfile, href: '/family/profile/delete', danger: true },
    ];

    return (
        <div className="min-h-screen pt-12 px-5 pb-24" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md mx-auto">
                <h1 className="mb-8"
                    style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '27px', lineHeight: '30px' }}>
                    {de.profile.greeting} {user.firstName}
                </h1>

                {/* Details */}
                <div className="bg-white rounded-[8px] p-7 shadow-sm mb-4 relative overflow-hidden">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-30 mb-4"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.profile.details}</h3>
                    <p className="font-bold text-[18px] mb-1">{user.firstName} {user.lastName}</p>
                    <p className="opacity-60 text-[15px]">{user.email}</p>
                    <User className="absolute -bottom-5 -right-5 w-28 h-28 opacity-[0.03]" />
                </div>

                {/* Address */}
                <div className="bg-white rounded-[8px] p-7 shadow-sm mb-6 relative">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-30 mb-4"
                        style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>{de.profile.address}</h3>
                    {user.street ? (
                        <p className="font-bold text-[16px] leading-relaxed">
                            {user.street}<br />
                            {user.zipCode} {user.city}
                        </p>
                    ) : (
                        <p className="opacity-50 text-[14px]">Noch keine Adresse</p>
                    )}
                    <Link href="/family/profile/edit-address"
                        className="absolute top-7 right-7 w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: BRAND.green }}>
                        <Edit2 size={18} />
                    </Link>
                </div>

                {/* Accordion */}
                <div className="bg-white rounded-[8px] shadow-sm overflow-hidden divide-y divide-gray-300">
                    {accordionItems.map(({ label, href, danger }) => (
                        <Link key={label} href={href}
                            className="flex justify-between items-center px-7 py-5 hover:bg-gray-50 transition-colors group">
                            <span className="font-bold text-[15px] uppercase tracking-widest"
                                style={{
                                    fontFamily: "'Bricolage Grotesque',sans-serif",
                                    color: danger ? BRAND.error : '#000',
                                    opacity: 0.75,
                                }}>
                                {label}
                            </span>
                            <ChevronRight size={20} className="opacity-25 group-hover:opacity-60 transition-opacity" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

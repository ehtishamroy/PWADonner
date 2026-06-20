'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusCircle, User, LogOut } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

const navItems = [
    { href: '/donor/dashboard', label: de.nav.home,   icon: Home       },
    { href: '/donor/donate',    label: de.nav.donate,  icon: PlusCircle },
    { href: '/donor/profile',   label: de.nav.profile, icon: User       },
];

export function DonorSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogout, setShowLogout] = useState(false);

    return (
        <>
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-black/5 p-8 z-50">
                {/* Logo */}
                <Link href="/donor/dashboard" className="mb-12 block hover:opacity-80 transition-opacity">
                    <Logo size={72} animated={false} />
                </Link>

                {/* Nav */}
                <nav className="flex flex-col gap-3 flex-grow">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-4 group rounded-2xl px-3 py-2 transition-all hover:bg-gray-50"
                            >
                                <div className={`p-2 rounded-xl transition-all ${active ? 'bg-[#537D611A]' : 'group-hover:bg-[#537D610D]'}`}>
                                    <Icon size={22} strokeWidth={active ? 2.5 : 1.5} color={BRAND.green} />
                                </div>
                                <span
                                    className={`font-bold uppercase tracking-widest text-sm transition-all ${active ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                >
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                    {/* Logout button */}
                    <button
                        onClick={() => setShowLogout(true)}
                        className="flex items-center gap-4 group rounded-2xl px-3 py-2 transition-all hover:bg-gray-50 text-left"
                    >
                        <div className="p-2 rounded-xl transition-all group-hover:bg-[#537D610D]">
                            <LogOut size={22} strokeWidth={1.5} color={BRAND.green} />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-sm opacity-40 group-hover:opacity-80 transition-all"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            {de.nav.logout}
                        </span>
                    </button>
                </nav>

                {/* Footer */}
                <div className="mt-auto pt-6 border-t border-black/5">
                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-20"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Wärme Schenken v1.0
                    </p>
                </div>
            </aside>

            {/* Logout confirmation modal */}
            {showLogout && (
                <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center px-6"
                    onClick={() => setShowLogout(false)}>
                    <div className="bg-white rounded-[16px] p-7 w-full max-w-xs shadow-xl"
                        onClick={e => e.stopPropagation()}>
                        <p className="text-[18px] font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Abmelden?</p>
                        <p className="text-[14px] opacity-60 mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Du bist dabei, dich abzumelden.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogout(false)}
                                className="flex-1 h-10 rounded-full border-2 font-bold text-[13px] uppercase tracking-widest"
                                style={{ borderColor: BRAND.green, color: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                Abbrechen
                            </button>
                            <button
                                onClick={() => router.push('/donor/logout')}
                                className="flex-1 h-10 rounded-full font-bold text-[13px] uppercase tracking-widest text-white"
                                style={{ backgroundColor: BRAND.green, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                Abmelden
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

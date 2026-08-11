'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { de } from '@/lib/i18n/de';
import { MenuHome, MenuProfile } from './MenuIcons';

const navItems = [
    { href: '/donor/dashboard', label: de.nav.home,    icon: 'home'    },
    { href: '/donor/donate',    label: de.nav.donate,  icon: 'donate'  },
    { href: '/donor/profile',   label: de.nav.profile, icon: 'profile' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 z-50 pb-safe md:hidden">
            <div className="flex justify-around items-center py-3 px-2 max-w-md mx-auto">
                {navItems.map(({ href, label, icon }) => {
                    const active = pathname.startsWith(href);
                    const color = active ? '#537D61' : '#000000';
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-1 min-w-[60px] group"
                        >
                            <div className="p-1.5 rounded-xl transition-colors">
                                {icon === 'home' ? (
                                    <MenuHome size={24} color={color} />
                                ) : icon === 'profile' ? (
                                    <MenuProfile size={24} color={color} />
                                ) : (
                                    <PlusCircle size={24} color={color} strokeWidth={active ? 2.5 : 1.5} />
                                )}
                            </div>
                            <span
                                className="text-[11px] font-medium transition-colors"
                                style={{ color, fontFamily: "'Inter', sans-serif" }}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, User, LogOut } from 'lucide-react';
import { de } from '@/lib/i18n/de';
import { BRAND } from '@/lib/constants';

const navItems = [
    { href: '/donor/dashboard', label: de.nav.home,   icon: Home       },
    { href: '/donor/donate',    label: de.nav.donate,  icon: PlusCircle },
    { href: '/donor/profile',   label: de.nav.profile, icon: User       },
    { href: '/donor/logout',    label: de.nav.logout,  icon: LogOut     },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 z-50 pb-safe md:hidden">
            <div className="flex justify-around items-center py-3 px-2 max-w-md mx-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-1 min-w-[60px] group"
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-brand-green/10' : ''}`}>
                                <Icon
                                    size={24}
                                    strokeWidth={active ? 2.5 : 1.5}
                                    color={active ? '#000000' : '#777'}
                                />
                            </div>
                            <span
                                className="text-[11px] font-medium transition-colors"
                                style={{
                                    color:       active ? '#000000' : '#777',
                                    fontFamily: "'Inter', sans-serif",
                                }}
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

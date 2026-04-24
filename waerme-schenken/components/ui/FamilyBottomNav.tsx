'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { de } from '@/lib/i18n/de';

const navItems = [
    { href: '/family/dashboard', label: de.family.nav.home,    icon: Home         },
    { href: '/family/shop',      label: de.family.nav.shop,    icon: ShoppingBag  },
    { href: '/family/cart',      label: de.family.nav.cart,    icon: ShoppingCart },
    { href: '/family/profile',   label: de.family.nav.profile, icon: User         },
];

export function FamilyBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 z-50 pb-safe md:hidden">
            <div className="flex justify-around items-center py-3 px-2 max-w-md mx-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link key={href} href={href}
                            className="flex flex-col items-center gap-1 min-w-[60px] group">
                            <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-brand-green/10' : ''}`}>
                                <Icon size={24} strokeWidth={active ? 2.5 : 1.5} color={active ? '#000000' : '#777'} />
                            </div>
                            <span className="text-[11px] font-medium transition-colors"
                                style={{ color: active ? '#000000' : '#777', fontFamily: "'Inter', sans-serif" }}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

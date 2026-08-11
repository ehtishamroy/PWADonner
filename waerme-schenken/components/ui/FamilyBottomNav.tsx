'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { de } from '@/lib/i18n/de';
import { MenuHome, MenuToy, MenuCart, MenuProfile } from './MenuIcons';

const navItems = [
    { href: '/family/dashboard', label: de.family.nav.home,    icon: 'home'   },
    { href: '/family/shop',      label: de.family.nav.shop,    icon: 'shop'   },
    { href: '/family/cart',      label: de.family.nav.cart,    icon: 'cart'   },
    { href: '/family/profile',   label: de.family.nav.profile, icon: 'profile' },
];

export function FamilyBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 z-50 pb-safe md:hidden">
            <div className="flex justify-around items-center py-3 px-2 max-w-md mx-auto">
                {navItems.map(({ href, label, icon }) => {
                    const active = pathname.startsWith(href);
                    const color = active ? '#537D61' : '#000000';
                    return (
                        <Link key={href} href={href}
                            className="flex flex-col items-center gap-1 min-w-[60px] group">
                            <div className="p-1.5 rounded-xl transition-colors">
                                {icon === 'cart'
                                    ? <MenuCart size={24} color={color} />
                                    : icon === 'home'
                                        ? <MenuHome size={24} color={color} />
                                        : icon === 'shop'
                                            ? <MenuToy size={24} color={color} />
                                            : <MenuProfile size={24} color={color} />}
                            </div>
                            <span className="text-[11px] font-medium transition-colors"
                                style={{ color, fontFamily: "'Inter', sans-serif" }}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}


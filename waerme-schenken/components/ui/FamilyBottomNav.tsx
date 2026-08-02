'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, User } from 'lucide-react';
import { de } from '@/lib/i18n/de';

function CartIcon({ size = 24, active = false }: { size?: number; active?: boolean }) {
    return (
        <div style={{
            WebkitMaskImage: 'url(/images/cart.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/images/cart.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            backgroundColor: active ? '#000000' : '#777',
            width: size,
            height: size,
        }} />
    );
}

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
                    return (
                        <Link key={href} href={href}
                            className="flex flex-col items-center gap-1 min-w-[60px] group">
                            <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-brand-green/10' : ''}`}>
                                {icon === 'cart'
                                    ? <CartIcon size={24} active={active} />
                                    : icon === 'home'
                                        ? <Home size={24} strokeWidth={active ? 2.5 : 1.5} color={active ? '#000000' : '#777'} />
                                        : icon === 'shop'
                                            ? <ShoppingBag size={24} strokeWidth={active ? 2.5 : 1.5} color={active ? '#000000' : '#777'} />
                                            : <User size={24} strokeWidth={active ? 2.5 : 1.5} color={active ? '#000000' : '#777'} />}
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


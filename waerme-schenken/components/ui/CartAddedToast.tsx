'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';

/**
 * Listens for window "cart:added" events and shows a non-blocking toast
 * with a "Ansehen" link to the cart. Duplicate events re-trigger the timer.
 */
export function CartAddedToast() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        function onAdded() {
            setVisible(true);
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => setVisible(false), 3000);
        }
        window.addEventListener('cart:added', onAdded);
        return () => {
            window.removeEventListener('cart:added', onAdded);
            if (timer) clearTimeout(timer);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl"
            style={{ backgroundColor: BRAND.greenDark, color: '#fff', width: '90vw', fontFamily: "'Bricolage Grotesque',sans-serif" }}
        >
            <ShoppingCart size={18} className="shrink-0" />
            <span className="text-[14px] font-bold flex-1">{de.family.shop.addedToast}</span>
            <Link
                href="/family/cart"
                onClick={() => setVisible(false)}
                className="h-8 px-4 rounded-full font-bold text-xs flex items-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
                {de.family.shop.viewCart}
            </Link>
        </div>
    );
}

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
            timer = setTimeout(() => setVisible(false), 3500);
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
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-black/90 text-white pl-5 pr-2 py-2 rounded-full shadow-lg text-sm"
            style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}
        >
            <ShoppingCart size={16} />
            <span className="font-medium">{de.family.shop.addedToast}</span>
            <Link
                href="/family/cart"
                onClick={() => setVisible(false)}
                className="ml-1 h-8 px-4 rounded-full font-bold text-xs flex items-center"
                style={{ backgroundColor: BRAND.green, color: '#fff' }}
            >
                {de.family.shop.viewCart}
            </Link>
        </div>
    );
}

'use client';

import { useEffect } from 'react';

/**
 * Syncs the family localStorage cart with the server on mount.
 * If the server reports 0 selected donations but localStorage still has items,
 * it clears the stale localStorage cart. This fixes the bug where a
 * re-registered user (after account deletion) keeps a phantom cart.
 */
export function CartSync({ serverSelectedCount }: { serverSelectedCount: number }) {
    useEffect(() => {
        const KEY = 'ws_family_cart';
        const EXPIRY_KEY = 'ws_family_cart_expiry';

        if (typeof window === 'undefined') return;

        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return;
            const arr: string[] = JSON.parse(raw);
            if (!Array.isArray(arr) || arr.length === 0) return;

            // If server says 0 selected toys, clear localStorage completely
            if (serverSelectedCount === 0) {
                localStorage.removeItem(KEY);
                localStorage.removeItem(EXPIRY_KEY);
                window.dispatchEvent(new CustomEvent('ws-cart-change'));
            }
        } catch {
            // If parsing fails, clear it
            localStorage.removeItem(KEY);
            localStorage.removeItem(EXPIRY_KEY);
        }
    }, [serverSelectedCount]);

    return null;
}

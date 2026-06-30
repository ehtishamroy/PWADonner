// Family cart stored in localStorage. Max 5 items.
// Each entry is just the donation ID; details come from API on render.
'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'ws_family_cart';
export const CART_MAX = 5;

export function readCart(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
    } catch { return []; }
}

function writeCart(ids: string[]) {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('ws-cart-change'));
}

export function useFamilyCart() {
    const [ids, setIds] = useState<string[]>([]);

    useEffect(() => {
        setIds(readCart());
        const sync = () => setIds(readCart());
        window.addEventListener('ws-cart-change', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('ws-cart-change', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const add = useCallback(async (id: string): Promise<{ ok: boolean; reason?: 'limit' | 'reserved' }> => {
        const cur = readCart();
        if (cur.includes(id)) return { ok: true };
        if (cur.length >= CART_MAX) return { ok: false, reason: 'limit' };
        
        try {
            const res = await fetch('/api/family/cart/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                return { ok: false, reason: 'reserved' };
            }
        } catch {
            return { ok: false, reason: 'reserved' };
        }

        writeCart([...cur, id]);
        return { ok: true };
    }, []);

    const remove = useCallback((id: string) => {
        writeCart(readCart().filter(x => x !== id));
        fetch('/api/family/cart/unreserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        }).catch(() => {});
    }, []);

    const clear = useCallback(() => writeCart([]), []);

    const has = useCallback((id: string) => ids.includes(id), [ids]);

    return { ids, count: ids.length, add, remove, clear, has };
}

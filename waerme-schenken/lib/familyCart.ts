// Family cart stored in localStorage. Max 5 items.
// Each entry is the donation ID; reservation expiry is tracked in a parallel map.
'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY         = 'ws_family_cart';
const EXPIRY_KEY  = 'ws_family_cart_expiry'; // { [id]: isoString }
export const CART_MAX = 5;

function readExpiries(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(EXPIRY_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function writeExpiries(map: Record<string, string>) {
    localStorage.setItem(EXPIRY_KEY, JSON.stringify(map));
}

/** Read cart IDs, automatically pruning any whose reservation has expired. */
export function readCart(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return [];
        const arr: string[] = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];

        const expiries = readExpiries();
        const now = Date.now();
        const expired: string[] = [];
        const valid = arr.filter(id => {
            if (typeof id !== 'string') return false;
            const exp = expiries[id];
            if (exp && new Date(exp).getTime() <= now) {
                expired.push(id);
                return false;
            }
            return true;
        });

        // If anything expired, persist the pruned list and unreserve on server
        if (expired.length > 0) {
            localStorage.setItem(KEY, JSON.stringify(valid));
            const newExpiries = { ...expiries };
            for (const id of expired) delete newExpiries[id];
            writeExpiries(newExpiries);
            // Fire-and-forget unreserve for each expired item
            for (const id of expired) {
                fetch('/api/family/cart/unreserve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                }).catch(() => {});
            }
            window.dispatchEvent(new CustomEvent('ws-cart-change'));
        }

        return valid;
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

    // Poll every 30 s so expiry pruning fires even if no user interaction
    useEffect(() => {
        const t = setInterval(() => setIds(readCart()), 30_000);
        return () => clearInterval(t);
    }, []);

    const add = useCallback(async (id: string): Promise<{ ok: boolean; reason?: 'limit' | 'reserved' }> => {
        const cur = readCart();
        if (cur.includes(id)) return { ok: true };
        if (cur.length >= CART_MAX) return { ok: false, reason: 'limit' };

        let expiresAt: string | null = null;
        try {
            const res = await fetch('/api/family/cart/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) return { ok: false, reason: 'reserved' };
            const data = await res.json();
            expiresAt = data.reservedUntil ?? null;
        } catch {
            return { ok: false, reason: 'reserved' };
        }

        // Persist expiry
        if (expiresAt) {
            const expiries = readExpiries();
            expiries[id] = expiresAt;
            writeExpiries(expiries);
        }

        writeCart([...readCart(), id]);
        return { ok: true };
    }, []);

    const remove = useCallback((id: string) => {
        writeCart(readCart().filter(x => x !== id));
        // Remove expiry entry
        const expiries = readExpiries();
        delete expiries[id];
        writeExpiries(expiries);

        fetch('/api/family/cart/unreserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        }).catch(() => {});
    }, []);

    const clear = useCallback(() => {
        const expiries = readExpiries();
        for (const id of readCart()) delete expiries[id];
        writeExpiries(expiries);
        writeCart([]);
    }, []);

    const has = useCallback((id: string) => ids.includes(id), [ids]);

    /** Returns the ISO expiry string for an id, or null if not tracked. */
    const getExpiresAt = useCallback((id: string): string | null => {
        return readExpiries()[id] ?? null;
    }, []);

    return { ids, count: ids.length, add, remove, clear, has, getExpiresAt };
}

import { db } from './db';

type ShopWindow = { openDate: Date | null; closeDate: Date | null };

/**
 * Single source of truth for "is the toy shop open right now?".
 *
 * Open  = not before the opening date AND not after the closing date.
 * A missing date means "no limit on that side"; with no dates at all the shop
 * is open (default for a fresh install).
 *
 * IMPORTANT: this applies to EVERY family, including "special" families — they
 * used to bypass the opening date, which let them browse the shop early.
 */
export function isShopOpenAt(shop: ShopWindow | null | undefined, now: Date = new Date()): boolean {
    const open  = shop?.openDate  ?? null;
    const close = shop?.closeDate ?? null;
    if (open  && now < open)  return false;
    if (close && now > close) return false;
    return true;
}

export async function getShopStatus() {
    const shop = await db.shopConfig.findFirst();
    const now = new Date();
    return {
        isOpen:    isShopOpenAt(shop, now),
        openDate:  shop?.openDate  ?? null,
        closeDate: shop?.closeDate ?? null,
        // Only set while the opening date is still ahead — safe to announce.
        opensAt:   shop?.openDate && shop.openDate > now ? shop.openDate : null,
    };
}

export const SHOP_CLOSED_MESSAGE = 'Die Spielzeugbörse ist aktuell geschlossen.';

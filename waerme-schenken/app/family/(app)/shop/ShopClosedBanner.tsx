import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';

// `opensAt` is only passed while the opening date is still in the future (see
// getShopStatus) — after the shop has closed again, "opens on <past date>" would be wrong.
export function ShopClosedBanner({ opensAt }: { opensAt: string | null }) {
    const opens = opensAt ? new Date(opensAt) : null;
    const formatted = opens
        ? opens.toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Zurich' })
        : null;

    return (
        <div className="min-h-screen px-6 pt-20 pb-24" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md mx-auto bg-white rounded-[8px] p-10 text-center">
                <h1 className="mb-4" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '24px' }}>
                    {de.family.shop.shopClosed}
                </h1>
                {formatted && (
                    <p className="opacity-70">
                        {de.family.shop.shopOpensOn} <strong>{formatted}</strong>
                    </p>
                )}
            </div>
        </div>
    );
}

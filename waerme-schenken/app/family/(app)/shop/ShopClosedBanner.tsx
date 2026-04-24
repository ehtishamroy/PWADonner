import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';

export function ShopClosedBanner({ openDate }: { openDate: string | null; closeDate: string | null }) {
    const opens = openDate ? new Date(openDate) : null;
    const formatted = opens
        ? opens.toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="min-h-screen px-6 pt-20 pb-24" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-md mx-auto bg-white rounded-[8px] p-10 text-center shadow-sm">
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

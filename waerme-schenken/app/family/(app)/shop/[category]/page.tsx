import { BRAND } from '@/lib/constants';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getShopStatus } from '@/lib/shop-status';
import { ShopClosedBanner } from '../ShopClosedBanner';
import { ProductsGrid } from './ProductsGrid';

export default async function FamilyShopCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const decoded = decodeURIComponent(category);

    // The shop is closed for everyone (incl. special families) outside the
    // opening window — also when reached via a direct link or bookmark.
    const { isOpen, opensAt } = await getShopStatus();
    if (!isOpen) {
        return (
            <ShopClosedBanner opensAt={opensAt?.toISOString() ?? null} />
        );
    }

    const session = await getSession();
    const me = session ? await db.user.findUnique({ where: { id: session.userId } }) : null;
    const isSpecial = (me as { familySpecial?: boolean } | null)?.familySpecial === true;

    return (
        <div className="min-h-screen pt-6 px-4 pb-24 md:pl-8 md:pr-12 md:pt-12" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-3xl mx-auto">
                <ProductsGrid category={decoded} isSpecial={isSpecial} />
            </div>
        </div>
    );
}

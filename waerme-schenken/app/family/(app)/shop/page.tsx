import { db } from '@/lib/db';
import { BRAND } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { getSession } from '@/lib/auth';
import { getShopStatus } from '@/lib/shop-status';
import { ShopClosedBanner } from './ShopClosedBanner';
import { CategoryList } from './CategoryList';

// Category thumbnail background colours (design mockup)
const CATEGORY_BG: Record<string, string> = {
    Buch:                 '#e8d5b7',
    Duplo:                '#d4e0f0',
    Lego:                 '#d4e0f0',
    Playmobil:            '#c9ddc9',
    Hörspiel:             '#e8e0f0',
    Musik:                '#f0ead4',
    Plüschtier:           '#f0d4d4',
    'Puppen & Zubehör':   '#f5d5a0',
};

export default async function FamilyShopCategoriesPage() {
    const session = await getSession();
    const me = session ? await db.user.findUnique({ where: { id: session.userId } }) : null;
    // "Special" families keep their cart-limit exemption, but they are NOT
    // exempt from the opening window — the shop is closed for everyone until it opens.
    const isSpecial = (me as { familySpecial?: boolean } | null)?.familySpecial === true;

    const { isOpen, opensAt } = await getShopStatus();

    // Closed → show the notice and don't even load the catalogue.
    if (!isOpen) {
        return (
            <ShopClosedBanner opensAt={opensAt?.toISOString() ?? null} />
        );
    }

    // Count approved donations per category so we can show/hide empty categories
    const [counts, catImages, toyCategories] = await Promise.all([
        db.donation.groupBy({
            by: ['category'],
            where: { status: 'approved' },
            _count: true,
        }),
        db.categoryImage.findMany(),
        db.toyCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c.category, c._count]));
    const imageMap = Object.fromEntries(catImages.map(c => [c.category, c.imageUrl]));

    const categories = toyCategories.map(({ name }) => ({
        id:       name,
        name,
        bg:       CATEGORY_BG[name] || '#e8e0f0',
        count:    countMap[name] || 0,
        imageUrl: imageMap[name] || null,
    }));

    return (
        <div className="min-h-screen pt-12 px-6 pb-24 md:pl-8 md:pr-12 md:pt-12" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-3xl mx-auto">
                <CategoryList categories={categories} isSpecial={isSpecial} />
            </div>
        </div>
    );
}

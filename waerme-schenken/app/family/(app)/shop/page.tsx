import { db } from '@/lib/db';
import { BRAND, TOY_CATEGORIES } from '@/lib/constants';
import { de } from '@/lib/i18n/de';
import { getSession } from '@/lib/auth';
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
    const isSpecial = (me as { familySpecial?: boolean } | null)?.familySpecial === true;

    const shop = await db.shopConfig.findFirst();
    const now = new Date();
    const withinWindow = shop?.openDate && shop?.closeDate
        ? now >= shop.openDate && now <= shop.closeDate
        : true;
    // Special families can shop anytime (see spec 6.4 “Special Family”)
    const isOpen = withinWindow || isSpecial;

    // Count approved donations per category so we can show/hide empty categories
    const [counts, catImages] = await Promise.all([
        db.donation.groupBy({
            by: ['category'],
            where: { status: 'approved' },
            _count: true,
        }),
        db.categoryImage.findMany(),
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c.category, c._count]));
    const imageMap = Object.fromEntries(catImages.map(c => [c.category, c.imageUrl]));

    const categories = TOY_CATEGORIES.map(name => ({
        id:       name,
        name,
        bg:       CATEGORY_BG[name] || '#e8e0f0',
        count:    countMap[name] || 0,
        imageUrl: imageMap[name] || null,
    }));

    if (!isOpen) {
        return (
            <ShopClosedBanner
                openDate={shop?.openDate?.toISOString() ?? null}
                closeDate={shop?.closeDate?.toISOString() ?? null}
            />
        );
    }

    return (
        <div className="min-h-screen pt-12 px-6 pb-24 md:pl-8 md:pr-12 md:pt-12" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-3xl mx-auto">
                <CategoryList categories={categories} />
            </div>
        </div>
    );
}

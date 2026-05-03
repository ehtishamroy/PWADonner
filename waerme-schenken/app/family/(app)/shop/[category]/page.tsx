import { BRAND } from '@/lib/constants';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProductsGrid } from './ProductsGrid';

export default async function FamilyShopCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const decoded = decodeURIComponent(category);

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

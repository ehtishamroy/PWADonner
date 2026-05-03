import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { CategoryImageManager } from './CategoryImageManager';
import { CategoryManager } from './CategoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const [toyCategories, catImages] = await Promise.all([
        db.toyCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
        db.categoryImage.findMany(),
    ]);

    const imageMap = Object.fromEntries(catImages.map(r => [r.category, r.imageUrl]));

    const items = toyCategories.map(tc => ({
        category: tc.name,
        imageUrl: imageMap[tc.name] || null,
    }));

    return (
        <>
            <AdminHeader />
            <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Kategorien
                    </h2>
                    <p className="text-sm opacity-60 leading-relaxed max-w-xl">
                        Verwalte die Kategorien und lade für jede ein Bild hoch. Es erscheint in der Kategorieliste der Familien-Spielzeugbörse.
                    </p>
                </div>
                <CategoryManager categories={toyCategories.map(tc => ({ name: tc.name }))} />
                <CategoryImageManager items={items} />
            </main>
        </>
    );
}

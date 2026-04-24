import { db } from '@/lib/db';
import { AdminHeader } from '../components/AdminHeader';
import { TOY_CATEGORIES } from '@/lib/constants';
import { CategoryImageManager } from './CategoryImageManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const rows = await db.categoryImage.findMany();
    const map = Object.fromEntries(rows.map(r => [r.category, r.imageUrl]));

    const items = TOY_CATEGORIES.map(name => ({
        category: name,
        imageUrl: map[name] || null,
    }));

    return (
        <>
            <AdminHeader />
            <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        Kategoriebilder
                    </h2>
                    <p className="text-sm opacity-60 leading-relaxed max-w-xl">
                        Lade für jede Kategorie ein Bild hoch. Es erscheint in der Kategorieliste der Familien-Spielzeugbörse.
                    </p>
                </div>
                <CategoryImageManager items={items} />
            </main>
        </>
    );
}

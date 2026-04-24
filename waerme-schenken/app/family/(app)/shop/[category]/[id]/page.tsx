import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { BRAND, CONDITION_COLORS } from '@/lib/constants';
import { ProductDetail } from './ProductDetail';

export default async function FamilyProductDetailPage({ params }: { params: Promise<{ category: string; id: string }> }) {
    const { category, id } = await params;
    const decodedCategory = decodeURIComponent(category);

    const donation = await db.donation.findUnique({
        where:   { id },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!donation || donation.status !== 'approved') notFound();

    return (
        <div className="min-h-screen pb-24 md:pl-8 md:pr-12 md:pt-6" style={{ backgroundColor: BRAND.beige }}>
            <ProductDetail
                id={donation.id}
                category={decodedCategory}
                toyName={donation.toyName}
                ageRange={donation.ageRange}
                condition={donation.condition}
                description={donation.description}
                condColor={CONDITION_COLORS[donation.condition] || BRAND.mustard}
                images={donation.images.map(i => i.imageUrl)}
            />
        </div>
    );
}

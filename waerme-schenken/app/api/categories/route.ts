import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const categories = await db.toyCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { name: true },
    });
    return NextResponse.json({ categories: categories.map(c => c.name) });
}

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const CATEGORIES = [
    'Buch',
    'Duplo',
    'Lego',
    'Playmobil',
    'Hörspiel',
    'Musik',
    'Plüschtier',
    'Puppen & Zubehör',
    'Andere',
    'Basteln',
];

async function main() {
    for (let i = 0; i < CATEGORIES.length; i++) {
        await db.toyCategory.upsert({
            where:  { name: CATEGORIES[i] },
            create: { name: CATEGORIES[i], sortOrder: i },
            update: {},
        });
    }
    console.log(`Seeded ${CATEGORIES.length} categories`);
}

main().finally(() => db.$disconnect());

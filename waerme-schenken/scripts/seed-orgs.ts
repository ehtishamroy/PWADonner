import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const ORGS = ['Caritas', 'Rotes Kreuz', 'Heilsarmee', 'Diakonie', 'Andere'];
async function main() {
    for (let i = 0; i < ORGS.length; i++) {
        await db.socialCardOrg.upsert({
            where:  { name: ORGS[i] },
            create: { name: ORGS[i], sortOrder: i },
            update: {},
        });
    }
    console.log(`Seeded ${ORGS.length} organisations`);
}
main().finally(() => db.$disconnect());

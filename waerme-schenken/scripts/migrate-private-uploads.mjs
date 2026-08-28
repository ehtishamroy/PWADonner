/**
 * One-off migration: move sensitive uploads OUT of public/ and behind the
 * authenticated /api/uploads route.
 *
 *   - Moves files: public/uploads/{social-cards,reimbursements}/*  ->  private-uploads/{...}/*
 *   - Rewrites DB URLs: /uploads/{kind}/x  ->  /api/uploads/{kind}/x
 *       User.socialCardUrl              (social-cards)
 *       ReimbursementImage.imageUrl     (reimbursements)
 *
 * Idempotent: rows already on /api/uploads/ are skipped; missing files are
 * reported but do not abort the run. Donation images (public toy photos) are
 * intentionally left in public/.
 *
 * Run once after deploying the code, e.g.:
 *   node scripts/migrate-private-uploads.mjs
 */
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();
const CWD = process.cwd();

function move(kind, url) {
    // url like /uploads/social-cards/abc.jpg
    const filename = path.basename(url.split('?')[0]);
    const from = path.join(CWD, 'public', 'uploads', kind, filename);
    const toDir = path.join(CWD, 'private-uploads', kind);
    const to = path.join(toDir, filename);
    fs.mkdirSync(toDir, { recursive: true });
    if (fs.existsSync(from)) {
        fs.renameSync(from, to);
        return { moved: true, filename };
    }
    // Already moved, or file missing on disk — still rewrite the URL.
    return { moved: false, filename };
}

async function migrateSocialCards() {
    const users = await db.user.findMany({
        where: { socialCardUrl: { startsWith: '/uploads/social-cards/' } },
        select: { id: true, socialCardUrl: true },
    });
    let moved = 0, missing = 0;
    for (const u of users) {
        const r = move('social-cards', u.socialCardUrl);
        r.moved ? moved++ : missing++;
        await db.user.update({
            where: { id: u.id },
            data: { socialCardUrl: `/api/uploads/social-cards/${r.filename}` },
        });
    }
    return { total: users.length, moved, missing };
}

async function migrateReimbursements() {
    const imgs = await db.reimbursementImage.findMany({
        where: { imageUrl: { startsWith: '/uploads/reimbursements/' } },
        select: { id: true, imageUrl: true },
    });
    let moved = 0, missing = 0;
    for (const img of imgs) {
        const r = move('reimbursements', img.imageUrl);
        r.moved ? moved++ : missing++;
        await db.reimbursementImage.update({
            where: { id: img.id },
            data: { imageUrl: `/api/uploads/reimbursements/${r.filename}` },
        });
    }
    return { total: imgs.length, moved, missing };
}

async function main() {
    const sc = await migrateSocialCards();
    const rb = await migrateReimbursements();
    console.log('Social cards:', sc);
    console.log('Reimbursements:', rb);
    console.log('Done. Remaining public files (if any) can be deleted once verified.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => db.$disconnect());

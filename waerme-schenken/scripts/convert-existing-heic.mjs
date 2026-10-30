/**
 * One-off repair: convert photos that were uploaded as HEIC (iPhone) before
 * the server started converting uploads. Browsers other than Safari cannot
 * display HEIC, so these show up as broken images.
 *
 * For every DB row whose image URL ends in .heic / .heif:
 *     DonationImage.imageUrl, ReimbursementImage.imageUrl,
 *     CategoryImage.imageUrl, User.socialCardUrl
 *   1. convert the file to a web-safe JPEG next to it (same pipeline as
 *      lib/image-processing.ts: rotation applied, max 2000 px, no metadata),
 *   2. point the DB row(s) to the new .jpg,
 *   3. MOVE (never delete) the original into a holding folder outside the app.
 *
 * Safe by default:
 *   node scripts/convert-existing-heic.mjs           # dry run: only lists, changes nothing
 *   node scripts/convert-existing-heic.mjs --apply   # converts
 * Options:
 *   --originals-dir=/path   where originals are moved (default: ../heic-originals)
 *
 * Idempotent: converted rows end in .jpg and are not picked up again. Missing
 * or unreadable files are reported and left untouched.
 */
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import decodeHeic from 'heic-decode';
import fs from 'fs';
import path from 'path';

const APPLY = process.argv.includes('--apply');
const CWD = process.cwd();
const ORIGINALS_DIR = path.resolve(
    process.argv.find(a => a.startsWith('--originals-dir='))?.split('=')[1] ?? path.join(CWD, '..', 'heic-originals'),
);

sharp.concurrency(1);
sharp.cache(false);

const db = new PrismaClient();

// ── conversion (keep in sync with lib/image-processing.ts) ──────────────────
const MAX_IMAGE_DIM = 2000;
const HEVC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs']);
const GENERIC_HEIF_BRANDS = new Set(['mif1', 'msf1']);
const AVIF_BRANDS = new Set(['avif', 'avis']);

function isHeic(buf) {
    if (buf.length < 16 || buf.toString('latin1', 4, 8) !== 'ftyp') return false;
    const boxSize = Math.min(buf.readUInt32BE(0), buf.length, 256);
    const brands = new Set([buf.toString('latin1', 8, 12)]);
    for (let off = 16; off + 4 <= boxSize; off += 4) brands.add(buf.toString('latin1', off, off + 4));
    if ([...brands].some(b => HEVC_BRANDS.has(b))) return true;
    if ([...brands].some(b => AVIF_BRANDS.has(b))) return false;
    return [...brands].some(b => GENERIC_HEIF_BRANDS.has(b));
}

async function toJpeg(input) {
    let img;
    if (isHeic(input)) {
        const { width, height, data } = await decodeHeic({ buffer: input });
        img = sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), { raw: { width, height, channels: 4 } });
    } else {
        img = sharp(input).rotate(); // e.g. a JPEG that was only named .heic
    }
    return img
        .resize({ width: MAX_IMAGE_DIM, height: MAX_IMAGE_DIM, fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
}

// ── URL <-> file path ────────────────────────────────────────────────────────
const HEIC_EXT = /\.(heic|heif)$/i;

function fileForUrl(url) {
    const pathname = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0];
    let base, rel;
    if (pathname.startsWith('/api/uploads/')) {
        base = path.join(CWD, 'private-uploads');
        rel = pathname.slice('/api/uploads/'.length);
    } else if (pathname.startsWith('/uploads/')) {
        base = path.join(CWD, 'public', 'uploads');
        rel = pathname.slice('/uploads/'.length);
    } else {
        return null;
    }
    const abs = path.resolve(base, rel);
    return abs.startsWith(base + path.sep) ? abs : null; // no path traversal
}

function jpgUrlFor(url, jpgFile) {
    return url.replace(/[^/?]+(\?.*)?$/, path.basename(jpgFile));
}

function freeJpgPath(heicFile) {
    let candidate = heicFile.replace(HEIC_EXT, '.jpg');
    for (let i = 1; fs.existsSync(candidate); i++) candidate = heicFile.replace(HEIC_EXT, `-${i}.jpg`);
    return candidate;
}

// ── collect rows ─────────────────────────────────────────────────────────────
const heicWhere = (field) => ({
    OR: [
        { [field]: { endsWith: '.heic', mode: 'insensitive' } },
        { [field]: { endsWith: '.heif', mode: 'insensitive' } },
    ],
});

async function collect() {
    const rows = [];
    for (const r of await db.donationImage.findMany({ where: heicWhere('imageUrl'), select: { id: true, imageUrl: true } })) {
        rows.push({ table: 'donationImage', field: 'imageUrl', id: r.id, url: r.imageUrl });
    }
    for (const r of await db.reimbursementImage.findMany({ where: heicWhere('imageUrl'), select: { id: true, imageUrl: true } })) {
        rows.push({ table: 'reimbursementImage', field: 'imageUrl', id: r.id, url: r.imageUrl });
    }
    for (const r of await db.categoryImage.findMany({ where: heicWhere('imageUrl'), select: { id: true, imageUrl: true } })) {
        rows.push({ table: 'categoryImage', field: 'imageUrl', id: r.id, url: r.imageUrl });
    }
    for (const r of await db.user.findMany({ where: heicWhere('socialCardUrl'), select: { id: true, socialCardUrl: true } })) {
        rows.push({ table: 'user', field: 'socialCardUrl', id: r.id, url: r.socialCardUrl });
    }
    return rows;
}

async function main() {
    console.log(APPLY ? '== APPLY MODE: files will be converted ==' : '== DRY RUN: nothing will be changed (add --apply to convert) ==');
    console.log('Originals will be moved to:', ORIGINALS_DIR);

    const rows = await collect();
    // The same file can in theory be referenced by several rows.
    const byUrl = new Map();
    for (const r of rows) byUrl.set(r.url, [...(byUrl.get(r.url) ?? []), r]);
    console.log(`Found ${rows.length} DB row(s) pointing to ${byUrl.size} HEIC/HEIF file(s).\n`);

    const stats = { converted: 0, wouldConvert: 0, missing: 0, failed: 0 };

    for (const [url, refs] of byUrl) {
        const label = `${refs.map(r => `${r.table}:${r.id}`).join(', ')}  ${url}`;
        const file = fileForUrl(url);
        if (!file || !fs.existsSync(file)) {
            stats.missing++;
            console.log(`MISSING   ${label}`);
            continue;
        }
        const input = fs.readFileSync(file);
        if (!APPLY) {
            stats.wouldConvert++;
            console.log(`WOULD CONVERT (${isHeic(input) ? 'HEIC' : 'not HEIC content'}, ${Math.round(input.length / 1024)} KB)  ${label}`);
            continue;
        }

        let jpgFile = null;
        try {
            const jpeg = await toJpeg(input);
            jpgFile = freeJpgPath(file);
            fs.writeFileSync(jpgFile, jpeg);
            const newUrl = jpgUrlFor(url, jpgFile);

            await db.$transaction(refs.map(r => db[r.table].update({ where: { id: r.id }, data: { [r.field]: newUrl } })));

            const keep = path.join(ORIGINALS_DIR, path.relative(CWD, file));
            fs.mkdirSync(path.dirname(keep), { recursive: true });
            try {
                fs.renameSync(file, keep);
            } catch {
                fs.copyFileSync(file, keep); // different disk: copy, verify, then remove
                if (fs.statSync(keep).size !== input.length) throw new Error('copy of original incomplete');
                fs.unlinkSync(file);
            }
            stats.converted++;
            console.log(`CONVERTED (${Math.round(input.length / 1024)} KB -> ${Math.round(jpeg.length / 1024)} KB)  ${label}  ->  ${newUrl}`);
        } catch (err) {
            stats.failed++;
            // DB not updated (or update failed): drop the half-made JPEG, keep the original in place.
            if (jpgFile && fs.existsSync(jpgFile)) {
                const stillUsed = refs.length && (await db[refs[0].table].findUnique({ where: { id: refs[0].id } }))?.[refs[0].field] === jpgUrlFor(url, jpgFile);
                if (!stillUsed) fs.unlinkSync(jpgFile);
            }
            console.log(`FAILED    ${label}  (${err.message})`);
        }
    }

    console.log('\nSummary:', stats);
    if (!APPLY && stats.wouldConvert) console.log('Run again with --apply to convert these files.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => db.$disconnect());

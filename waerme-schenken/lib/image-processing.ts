import sharp from 'sharp';
import type { Sharp } from 'sharp';
import decodeHeic from 'heic-decode';

// ── Photo normalisation for every user upload ───────────────────────────────
// iPhones save photos as HEIC, which only Safari can display. Every uploaded
// photo is therefore converted to a web-safe JPEG on the server:
//   • HEIC/HEIF is decoded with libheif (heic-decode). The sharp build shipped
//     with Next has no HEVC decoder, so it cannot read HEIC itself.
//   • EXIF rotation is applied, the image is scaled down to MAX_IMAGE_DIM and
//     all metadata (incl. GPS location) is dropped.
// Decoding a 12 MP iPhone photo needs ~250 MB, so photos are processed one at a
// time to keep the small VPS within its memory.

sharp.concurrency(1);
sharp.cache(false);

export const MAX_IMAGE_DIM = 2000;
const JPEG_QUALITY = 85;
const MAX_PIXELS = 60_000_000; // ~60 MP, well above any phone camera

export const IMAGE_ERROR_MESSAGE =
    'Dieses Foto konnte nicht verarbeitet werden. Bitte als JPG oder PNG hochladen.';

export class ImageProcessingError extends Error {}

export type WebImage = { buffer: Buffer; ext: 'jpg' | 'gif' };

const HEVC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs']);
const GENERIC_HEIF_BRANDS = new Set(['mif1', 'msf1']);
const AVIF_BRANDS = new Set(['avif', 'avis']);
const CONVERTIBLE = new Set(['jpeg', 'png', 'webp', 'tiff', 'heif']); // heif = AVIF in sharp

/**
 * Detect HEIC by its content (the ISO-BMFF `ftyp` box), not by the file name
 * or the MIME type the browser reports — both are often missing or wrong.
 */
export function isHeic(buf: Buffer): boolean {
    if (buf.length < 16 || buf.toString('latin1', 4, 8) !== 'ftyp') return false;
    const boxSize = Math.min(buf.readUInt32BE(0), buf.length, 256);
    const brands = new Set<string>([buf.toString('latin1', 8, 12)]);
    for (let off = 16; off + 4 <= boxSize; off += 4) brands.add(buf.toString('latin1', off, off + 4));

    if ([...brands].some(b => HEVC_BRANDS.has(b))) return true;
    if ([...brands].some(b => AVIF_BRANDS.has(b))) return false; // AVIF: sharp reads it directly
    return [...brands].some(b => GENERIC_HEIF_BRANDS.has(b));
}

let queue: Promise<unknown> = Promise.resolve();
function oneAtATime<T>(job: () => Promise<T>): Promise<T> {
    const run = queue.then(job, job);
    queue = run.catch(() => undefined);
    return run;
}

async function convert(input: Buffer): Promise<WebImage> {
    let img: Sharp;

    if (isHeic(input)) {
        let decoded: { width: number; height: number; data: Uint8ClampedArray };
        try {
            decoded = await decodeHeic({ buffer: input });
        } catch (err) {
            throw new ImageProcessingError(`HEIC decode failed: ${(err as Error).message}`);
        }
        const { width, height, data } = decoded;
        if (!width || !height || width * height > MAX_PIXELS) {
            throw new ImageProcessingError(`HEIC has unsupported size ${width}x${height}`);
        }
        // libheif already applies the HEIC rotation, so no .rotate() here.
        img = sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), {
            raw: { width, height, channels: 4 },
        });
    } else {
        let format: string | undefined;
        try {
            format = (await sharp(input).metadata()).format;
        } catch (err) {
            throw new ImageProcessingError(`Unreadable image: ${(err as Error).message}`);
        }
        // Keep GIFs as they are (may be animated); they display everywhere.
        if (format === 'gif') return { buffer: input, ext: 'gif' };
        if (!format || !CONVERTIBLE.has(format)) {
            throw new ImageProcessingError(`Unsupported image format: ${format ?? 'unknown'}`);
        }
        img = sharp(input, { limitInputPixels: MAX_PIXELS }).rotate();
    }

    try {
        const buffer = await img
            .resize({ width: MAX_IMAGE_DIM, height: MAX_IMAGE_DIM, fit: 'inside', withoutEnlargement: true })
            .flatten({ background: '#ffffff' })
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();
        return { buffer, ext: 'jpg' };
    } catch (err) {
        throw new ImageProcessingError(`Image conversion failed: ${(err as Error).message}`);
    }
}

/** Convert any uploaded photo (HEIC, JPEG, PNG, WebP, …) to a web-safe image. */
export function toWebImage(input: Buffer): Promise<WebImage> {
    return oneAtATime(() => convert(input));
}

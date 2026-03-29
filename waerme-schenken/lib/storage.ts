import path from 'path';
import fs   from 'fs';

// ── Local storage (dev) — swap UPLOAD_BASE_URL + sftp logic for VPS ──────────
export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'donations');

export function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}

/**
 * Always returns a relative URL for an uploaded file.
 * This avoids the Next.js Image optimizer trying to remotely fetch
 * its own server's files via an absolute URL (which causes "upstream
 * response is invalid" errors).
 * Use UPLOAD_BASE_URL only if you serve uploads from a separate CDN.
 */
export function getPublicUrl(filename: string): string {
    const base = process.env.UPLOAD_BASE_URL || '';
    // If a CDN base is configured, use it; otherwise always relative
    if (base && !base.startsWith('http://localhost') && base !== '') {
        // For CDN — store absolute URL (images served from separate domain)
        // Comment this out if having issues; prefer relative paths
        // return `${base}/uploads/donations/${filename}`;
    }
    return `/uploads/donations/${filename}`;
}

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

/**
 * Safely deletes a file from the public directory if it exists.
 * Expects a relative public URL (e.g., /uploads/donations/123.jpg).
 */
export async function deleteFile(publicUrl: string | null | undefined) {
    if (!publicUrl || !publicUrl.startsWith('/uploads/')) return;
    
    // Remove leading slash to make it relative to 'public'
    const relativePath = publicUrl.substring(1);
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    
    try {
        await fs.promises.unlink(absolutePath);
    } catch (e) {
        // Ignore if file doesn't exist
    }
}

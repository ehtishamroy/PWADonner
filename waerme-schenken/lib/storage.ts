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
 * Returns the public URL for an uploaded file.
 * In dev: /uploads/donations/filename.jpg
 * In prod: UPLOAD_BASE_URL + /uploads/donations/filename.jpg
 */
export function getPublicUrl(filename: string): string {
    const base = process.env.UPLOAD_BASE_URL || '';
    return `${base}/uploads/donations/${filename}`;
}

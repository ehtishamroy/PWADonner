import path from 'path';
import fs   from 'fs';

// ── Local storage (dev) — swap UPLOAD_BASE_URL + sftp logic for VPS ──────────
export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'donations');

// ── Private uploads (NOT served statically) ─────────────────────────────────
// Sensitive files (social cards, reimbursement receipts) live OUTSIDE public/
// so Next.js never serves them directly. They are streamed only through the
// authenticated route handler at /api/uploads/[kind]/[filename].
export const PRIVATE_UPLOADS_DIR = path.join(process.cwd(), 'private-uploads');
export type PrivateKind = 'social-cards' | 'reimbursements';

export function ensurePrivateDir(kind: PrivateKind): string {
    const dir = path.join(PRIVATE_UPLOADS_DIR, kind);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export function privateUploadUrl(kind: PrivateKind, filename: string): string {
    return `/api/uploads/${kind}/${filename}`;
}

/**
 * Resolve a stored `/api/uploads/<kind>/<file>` URL to an absolute path on
 * disk, with path-traversal protection. Returns null if the URL is malformed
 * or escapes the private uploads directory.
 */
export function resolvePrivateUploadPath(url: string): string | null {
    const m = /^\/api\/uploads\/(social-cards|reimbursements)\/([^/]+)$/.exec(url);
    if (!m) return null;
    const kind = m[1];
    const filename = path.basename(m[2]); // defend against traversal
    const abs = path.resolve(path.join(PRIVATE_UPLOADS_DIR, kind, filename));
    const kindDir = path.resolve(path.join(PRIVATE_UPLOADS_DIR, kind));
    if (!abs.startsWith(kindDir + path.sep)) return null;
    return abs;
}

async function deletePrivateFile(url: string) {
    const abs = resolvePrivateUploadPath(url);
    if (!abs) return;
    try {
        await fs.promises.unlink(abs);
    } catch {
        // Ignore if file doesn't exist
    }
}

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
 * Safely deletes a file from the public/uploads directory if it exists.
 * Expects a relative public URL (e.g., /uploads/donations/123.jpg).
 */
export async function deleteFile(publicUrl: string | null | undefined) {
    if (!publicUrl) return;

    // Private (authed) uploads live outside public/ — delete them there.
    if (publicUrl.startsWith('/api/uploads/')) {
        return deletePrivateFile(publicUrl);
    }

    if (!publicUrl.startsWith('/uploads/')) return;

    const relativePath = publicUrl.substring(1);
    const absolutePath = path.resolve(path.join(process.cwd(), 'public', relativePath));
    const uploadsDir = path.resolve(path.join(process.cwd(), 'public', 'uploads'));

    if (!absolutePath.startsWith(uploadsDir + path.sep)) return;

    try {
        await fs.promises.unlink(absolutePath);
    } catch {
        // Ignore if file doesn't exist
    }
}

import { db } from './db';

/** Canonical form of an email address: trimmed + lower-cased. */
export function normalizeEmail(email: unknown): string {
    return typeof email === 'string' ? email.toLowerCase().trim() : '';
}

/** Keep only digits — OTP codes are 6 digits, but pasted text may carry spaces/newlines. */
export function normalizeOtpCode(code: unknown): string {
    return typeof code === 'string' || typeof code === 'number'
        ? String(code).replace(/\D/g, '')
        : '';
}

/**
 * Find a user by email, case-insensitively. Accounts created before emails were
 * normalised may be stored with capital letters; an exact-match lookup on the
 * lower-cased address would miss them.
 */
export async function findUserByEmail(email: unknown) {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    return db.user.findFirst({
        where: { email: { equals: normalized, mode: 'insensitive' } },
    });
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
    const c = await cookies();
    return c.get('ws_admin_session')?.value === 'true';
}

/**
 * Safely deletes a file from disk.
 * Returns true on success, false if deletion fails (logs the error, never throws).
 */
function safeDeleteFile(filePath: string): boolean {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return true;
    } catch (err) {
        console.error(`[season-reset] Failed to delete file: ${filePath}`, err);
        return false;
    }
}

/**
 * Extracts the bare filename from a stored URL.
 * Handles both relative paths like /uploads/social-cards/abc.jpg
 * and absolute URLs like https://cdn.example.com/uploads/social-cards/abc.jpg
 */
function filenameFromUrl(url: string): string {
    return path.basename(url.split('?')[0]);
}

/**
 * POST /api/admin/season-reset
 *
 * Executes the full season reset:
 * 1. Validates admin session
 * 2. Checks the reset is not locked
 * 3. Deletes all social-card image FILES from disk (GDPR compliance)
 * 4. Clears socialCardUrl + socialCardOrg on all family User rows
 * 5. Collects all donation image + reimbursement image file URLs
 * 6. Deletes all Donation rows (cascades: DonationImage, ShippingReimbursement, ReimbursementImage)
 * 7. Deletes the corresponding image FILES from disk
 * 8. Stamps lastResetAt on AppSettings
 *
 * Never throws on individual file-deletion failures — they are logged and counted.
 */
export async function POST() {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // ── 1. Load settings & check lock ────────────────────────────────────
        const settings = await db.appSettings.upsert({
            where:  { id: 'singleton' },
            create: { id: 'singleton', familyApprovalRequired: true },
            update: {},
        });

        const now = new Date();
        const isLocked =
            !!settings.lastResetAt &&
            (!settings.nextSeasonFrom || now < settings.nextSeasonFrom);

        if (isLocked) {
            return NextResponse.json(
                { error: 'Reset ist gesperrt. Der nächste Reset ist erst ab dem nächsten Saisonstart möglich.' },
                { status: 403 },
            );
        }

        // ── 2. Collect social-card file paths before DB update ───────────────
        const familiesWithCards = await db.user.findMany({
            where:  { role: 'family', socialCardUrl: { not: null } },
            select: { id: true, socialCardUrl: true },
        });

        const socialCardDir = path.join(process.cwd(), 'public', 'uploads', 'social-cards');

        // ── 3. Collect donation + reimbursement image paths before deletion ───
        const [donationImages, reimbursementImages] = await Promise.all([
            db.donationImage.findMany({ select: { imageUrl: true } }),
            db.reimbursementImage.findMany({ select: { imageUrl: true } }),
        ]);

        const donationDir      = path.join(process.cwd(), 'public', 'uploads', 'donations');
        // Reimbursement receipts use the same donations folder (per upload route)
        const reimbursementDir = path.join(process.cwd(), 'public', 'uploads', 'donations');

        // ── 4. Delete social-card image files from disk ───────────────────────
        let socialFilesDeleted = 0;
        let socialFilesFailed  = 0;

        for (const family of familiesWithCards) {
            if (!family.socialCardUrl) continue;
            const filename = filenameFromUrl(family.socialCardUrl);
            const filePath = path.join(socialCardDir, filename);
            if (safeDeleteFile(filePath)) {
                socialFilesDeleted++;
            } else {
                socialFilesFailed++;
            }
        }

        // ── 5. Clear social-card fields on all family rows ────────────────────
        await db.user.updateMany({
            where: { role: 'family' },
            data:  { socialCardUrl: null, socialCardOrg: null, familyApproved: false },
        });

        // ── 6. Delete all Donation rows (cascades to DonationImage + ShippingReimbursement + ReimbursementImage) ──
        const { count: donationsDeleted } = await db.donation.deleteMany({});

        // ── 7. Delete donation image files from disk ──────────────────────────
        let donationFilesDeleted = 0;
        let donationFilesFailed  = 0;

        for (const img of donationImages) {
            const filename = filenameFromUrl(img.imageUrl);
            const filePath = path.join(donationDir, filename);
            if (safeDeleteFile(filePath)) {
                donationFilesDeleted++;
            } else {
                donationFilesFailed++;
            }
        }

        // ── 8. Delete reimbursement receipt image files from disk ─────────────
        for (const img of reimbursementImages) {
            const filename = filenameFromUrl(img.imageUrl);
            const filePath = path.join(reimbursementDir, filename);
            if (safeDeleteFile(filePath)) {
                donationFilesDeleted++;
            } else {
                donationFilesFailed++;
            }
        }

        // ── 9. Stamp lastResetAt ──────────────────────────────────────────────
        await db.appSettings.update({
            where: { id: 'singleton' },
            data:  { lastResetAt: now },
        });

        console.log(`[season-reset] Completed at ${now.toISOString()}`, {
            socialCardsCleared:   familiesWithCards.length,
            socialFilesDeleted,
            socialFilesFailed,
            donationsDeleted,
            donationFilesDeleted,
            donationFilesFailed,
        });

        return NextResponse.json({
            ok: true,
            socialCardsCleared:   familiesWithCards.length,
            socialFilesDeleted,
            socialFilesFailed,
            donationsDeleted,
            donationFilesDeleted,
            donationFilesFailed,
            executedAt: now.toISOString(),
        });

    } catch (err) {
        console.error('[season-reset] Fatal error:', err);
        return NextResponse.json(
            { error: 'Reset fehlgeschlagen. Bitte Logs prüfen.' },
            { status: 500 },
        );
    }
}

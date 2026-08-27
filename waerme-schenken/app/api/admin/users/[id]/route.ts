import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deleteFile } from '@/lib/storage';
import { sendToyDeletedEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/admin-auth';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;

    try {
        const user = await db.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (user.role === 'admin') {
            return NextResponse.json({ error: 'Admin-Benutzer können nicht gelöscht werden.' }, { status: 400 });
        }

        // If donor: process their donations before deletion
        const donations = await db.donation.findMany({
            where:   { donorId: id },
            include: { images: true, reimbursement: { include: { images: true } } },
        });

        for (const d of donations) {
            // Notify family if a selected toy is being removed
            if (d.status === 'selected' && d.selectedByFamilyId) {
                const family = await db.user.findUnique({ where: { id: d.selectedByFamilyId } });
                if (family) {
                    sendToyDeletedEmail(family.email, family.firstName, d.toyName).catch(console.error);
                }
            }
            // Delete donation images from disk
            for (const img of d.images) {
                await deleteFile(img.imageUrl);
            }
            // Delete reimbursement images from disk
            if (d.reimbursement) {
                for (const img of d.reimbursement.images) {
                    await deleteFile(img.imageUrl);
                }
            }
        }

        // Delete social card from disk if exists
        if (user.socialCardUrl) {
            await deleteFile(user.socialCardUrl);
        }

        // Delete user (Prisma cascade handles the rest)
        await db.user.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('admin delete user error', err);
        return NextResponse.json({ error: 'Löschen fehlgeschlagen.' }, { status: 500 });
    }
}

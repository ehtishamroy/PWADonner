import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { ensurePrivateDir, privateUploadUrl } from '@/lib/storage';
import { toWebImage, ImageProcessingError, IMAGE_ERROR_MESSAGE } from '@/lib/image-processing';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 10; // converted + downsized on the server

// Reimbursement receipts are sensitive (financial docs) → private storage,
// served only via the authenticated /api/uploads route.
function ensureReimbursementDir(): string {
    return ensurePrivateDir('reimbursements');
}

function getReimbursementUrl(filename: string): string {
    return privateUploadUrl('reimbursements', filename);
}

// GET - List donor's reimbursements
export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const reimbursements = await db.shippingReimbursement.findMany({
            where: { donorId: session.userId },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                donation: {
                    select: { toyName: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reimbursements });
    } catch (err) {
        console.error('reimbursement get error', err);
        return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
    }
}

// POST - Create new reimbursement request
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const donationId = formData.get('donationId') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const images: File[] = [];

        // Collect images
        for (let i = 0; i < MAX_IMAGES; i++) {
            const img = formData.get(`image${i}`) as File | null;
            if (img) images.push(img);
        }

        // Validation
        if (!donationId || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }
        if (amount > 500) {
            return NextResponse.json({ error: 'Betrag zu hoch (max. CHF 500).' }, { status: 400 });
        }
        const roundedAmount = Math.round(amount * 100) / 100;
        if (images.length === 0) {
            return NextResponse.json({ error: 'At least 1 receipt image required' }, { status: 400 });
        }

        // Check donation exists and belongs to donor
        const donation = await db.donation.findFirst({
            where: { id: donationId, donorId: session.userId }
        });
        if (!donation) {
            return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
        }

        // Check if reimbursement already exists for this donation
        const existing = await db.shippingReimbursement.findFirst({
            where: { donationId }
        });
        if (existing) {
            return NextResponse.json({ error: 'Reimbursement already requested for this donation' }, { status: 409 });
        }

        // Convert every receipt first (HEIC included), so a bad file is
        // rejected before anything is written to disk.
        const converted = [];
        for (const img of images) {
            if (img.size > MAX_SIZE_MB * 1024 * 1024) {
                return NextResponse.json({ error: `Image too large (max ${MAX_SIZE_MB}MB)` }, { status: 400 });
            }
            try {
                converted.push(await toWebImage(Buffer.from(await img.arrayBuffer())));
            } catch (err) {
                if (err instanceof ImageProcessingError) {
                    console.warn('[reimbursement] rejected image:', err.message);
                    return NextResponse.json({ error: IMAGE_ERROR_MESSAGE }, { status: 400 });
                }
                throw err;
            }
        }

        // Upload images
        const reimbursementDir = ensureReimbursementDir();
        const imageUrls: string[] = [];
        for (const image of converted) {
            // Random filename — never leak userId/timestamp in the URL.
            const filename = `${crypto.randomBytes(16).toString('hex')}.${image.ext}`;
            const filepath = path.join(reimbursementDir, filename);
            fs.writeFileSync(filepath, image.buffer);
            imageUrls.push(getReimbursementUrl(filename));
        }

        // Create reimbursement
        const reimbursement = await db.shippingReimbursement.create({
            data: {
                donorId: session.userId,
                donationId,
                amount: roundedAmount,
                status: 'pending',
                images: {
                    create: imageUrls.map((url, i) => ({
                        imageUrl: url,
                        sortOrder: i
                    }))
                }
            },
            include: {
                images: true,
                donation: { select: { toyName: true } }
            }
        });

        return NextResponse.json({ reimbursement }, { status: 201 });
    } catch (err) {
        console.error('reimbursement post error', err);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

// Reimbursement upload directory
const REIMBURSEMENT_DIR = path.join(process.cwd(), 'public', 'uploads', 'reimbursements');

function ensureReimbursementDir() {
    if (!fs.existsSync(REIMBURSEMENT_DIR)) {
        fs.mkdirSync(REIMBURSEMENT_DIR, { recursive: true });
    }
}

function getReimbursementUrl(filename: string): string {
    return `/uploads/reimbursements/${filename}`;
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

        // Upload images
        ensureReimbursementDir();
        const imageUrls: string[] = [];
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (img.size > MAX_SIZE_MB * 1024 * 1024) {
                return NextResponse.json({ error: `Image too large (max ${MAX_SIZE_MB}MB)` }, { status: 400 });
            }

            // Validate type
            const fileType = img.type;
            if (!fileType.startsWith('image/')) {
                return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
            }

            const rawExt = fileType.split('/')[1]?.split('+')[0]?.toLowerCase() || 'jpg';
            const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']);
            const ext = allowed.has(rawExt) ? rawExt.replace('jpeg', 'jpg') : 'jpg';
            const filename = `${session.userId}-${Date.now()}-${i}.${ext}`;
            const filepath = path.join(REIMBURSEMENT_DIR, filename);

            const buffer = Buffer.from(await img.arrayBuffer());
            fs.writeFileSync(filepath, buffer);
            imageUrls.push(getReimbursementUrl(filename));
        }

        // Create reimbursement
        const reimbursement = await db.shippingReimbursement.create({
            data: {
                donorId: session.userId,
                donationId,
                amount,
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

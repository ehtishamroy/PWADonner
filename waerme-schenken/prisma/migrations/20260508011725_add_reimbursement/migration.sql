-- CreateTable
CREATE TABLE "ShippingReimbursement" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingReimbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReimbursementImage" (
    "id" TEXT NOT NULL,
    "reimbursementId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReimbursementImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingReimbursement_donationId_key" ON "ShippingReimbursement"("donationId");

-- CreateIndex
CREATE INDEX "ShippingReimbursement_donorId_idx" ON "ShippingReimbursement"("donorId");

-- CreateIndex
CREATE INDEX "ShippingReimbursement_donationId_idx" ON "ShippingReimbursement"("donationId");

-- CreateIndex
CREATE INDEX "ShippingReimbursement_status_idx" ON "ShippingReimbursement"("status");

-- CreateIndex
CREATE INDEX "ReimbursementImage_reimbursementId_idx" ON "ReimbursementImage"("reimbursementId");

-- AddForeignKey
ALTER TABLE "ShippingReimbursement" ADD CONSTRAINT "ShippingReimbursement_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingReimbursement" ADD CONSTRAINT "ShippingReimbursement_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimbursementImage" ADD CONSTRAINT "ReimbursementImage_reimbursementId_fkey" FOREIGN KEY ("reimbursementId") REFERENCES "ShippingReimbursement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

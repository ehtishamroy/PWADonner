-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "familyApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialCardOrg" TEXT,
ADD COLUMN     "socialCardUrl" TEXT,
ADD COLUMN     "street" TEXT;

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "familyApprovalRequired" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

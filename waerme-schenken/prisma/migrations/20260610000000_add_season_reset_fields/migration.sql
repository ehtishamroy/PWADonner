-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN "lastResetAt" TIMESTAMP(3),
ADD COLUMN "nextSeasonFrom" TIMESTAMP(3);

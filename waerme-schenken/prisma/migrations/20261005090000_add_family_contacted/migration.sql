-- Adds the "contacted" marker used in the admin family-approval workflow.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "contactedAt" TIMESTAMP(3);

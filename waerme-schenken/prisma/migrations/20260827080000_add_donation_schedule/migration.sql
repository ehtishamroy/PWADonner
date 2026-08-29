-- Adds the donation-form schedule columns to ShopConfig.
-- Idempotent guards let this reconcile databases where the columns were
-- previously added manually (outside the migration system).
ALTER TABLE "ShopConfig" ADD COLUMN IF NOT EXISTS "donationOpenDate" TIMESTAMP(3);
ALTER TABLE "ShopConfig" ADD COLUMN IF NOT EXISTS "donationCloseDate" TIMESTAMP(3);

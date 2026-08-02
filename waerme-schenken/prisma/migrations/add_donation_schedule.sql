-- Migration: add_donation_schedule
-- Run this directly on your PostgreSQL database at Infomaniak
-- This adds the two new columns for the donation form schedule feature

ALTER TABLE "ShopConfig" ADD COLUMN IF NOT EXISTS "donationOpenDate" TIMESTAMP(3);
ALTER TABLE "ShopConfig" ADD COLUMN IF NOT EXISTS "donationCloseDate" TIMESTAMP(3);

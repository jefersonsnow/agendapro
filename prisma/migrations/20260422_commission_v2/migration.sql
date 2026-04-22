-- Remove commission_rate from staff table
ALTER TABLE "staff" DROP COLUMN IF EXISTS "commission_rate";

-- Add commission_value to staff_services pivot table
ALTER TABLE "staff_services" ADD COLUMN IF NOT EXISTS "commission_value" DECIMAL(10,2);

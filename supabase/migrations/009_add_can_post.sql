-- Add can_post column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS can_post BOOLEAN DEFAULT false;

-- Add payment tracking columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_valid_until TIMESTAMPTZ;
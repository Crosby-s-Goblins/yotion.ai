-- Database Schema Updates for Stripe Integration
-- Run these commands in your Supabase SQL editor

-- Add columns for Stripe customer linking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_created_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles (subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles (premium);

-- Add constraints and default values
ALTER TABLE profiles ALTER COLUMN subscription_status SET DEFAULT 'inactive';

-- Add comments for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for linking subscriptions';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Current active Stripe subscription ID';
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status (active, cancelled, past_due, etc.)';
COMMENT ON COLUMN profiles.subscription_created_at IS 'Timestamp when subscription was created';
COMMENT ON COLUMN profiles.subscription_cancelled_at IS 'Timestamp when subscription was cancelled';

-- Query to check the updated schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN (
    'stripe_customer_id', 
    'stripe_subscription_id', 
    'subscription_status',
    'subscription_created_at',
    'subscription_cancelled_at',
    'premium',
    'paidUser'
  )
ORDER BY column_name;

-- Optional: View to check subscription status
CREATE OR REPLACE VIEW subscription_overview AS
SELECT 
  id,
  email,
  premium,
  paidUser,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  subscription_created_at,
  subscription_cancelled_at,
  CASE 
    WHEN premium = true AND subscription_status = 'active' THEN 'Active Premium'
    WHEN premium = false AND subscription_status = 'cancelled' THEN 'Cancelled'
    WHEN premium = false AND subscription_status IS NULL THEN 'Free User'
    ELSE 'Unknown Status'
  END as status_summary
FROM profiles
WHERE email IS NOT NULL
ORDER BY subscription_created_at DESC NULLS LAST; 
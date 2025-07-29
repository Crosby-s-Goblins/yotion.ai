-- Test Script for paidUser Column Integration
-- Run this in your Supabase SQL editor to verify everything is set up correctly

-- 1. Check current structure of profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('id', 'email', 'paidUser', 'premium', 'stripe_customer_id')
ORDER BY column_name;

-- 2. Check current users and their payment status
SELECT 
  id,
  email,
  paidUser,
  CASE 
    WHEN paidUser = true THEN 'Paid User ✅'
    WHEN paidUser = false THEN 'Free User 🆓'
    WHEN paidUser IS NULL THEN 'Status Unknown ❓'
  END as user_type,
  created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Test what happens when we simulate a successful payment
-- (This is just a test - replace 'your-user-id' with an actual user ID)
/*
UPDATE profiles 
SET 
  paidUser = true,
  premium = true,
  stripe_customer_id = 'cus_test_12345',
  subscription_status = 'active'
WHERE id = 'your-user-id'
RETURNING id, email, paidUser, premium;
*/

-- 4. Test what happens when we simulate a cancellation
-- (This is just a test - replace 'your-user-id' with an actual user ID)  
/*
UPDATE profiles 
SET 
  paidUser = false,
  premium = false,
  subscription_status = 'cancelled'
WHERE id = 'your-user-id'
RETURNING id, email, paidUser, premium;
*/

-- 5. Count users by payment status
SELECT 
  CASE 
    WHEN paidUser = true THEN 'Paid Users'
    WHEN paidUser = false THEN 'Free Users'
    WHEN paidUser IS NULL THEN 'Unknown Status'
  END as user_category,
  COUNT(*) as count
FROM profiles 
GROUP BY 
  CASE 
    WHEN paidUser = true THEN 'Paid Users'
    WHEN paidUser = false THEN 'Free Users'
    WHEN paidUser IS NULL THEN 'Unknown Status'
  END;

-- 6. Check if paidUser column allows the correct data types
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'paidUser';

-- Expected result: data_type should be 'boolean'

-- 7. If you need to add the missing columns for full Stripe integration, uncomment this:
/*
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
*/ 
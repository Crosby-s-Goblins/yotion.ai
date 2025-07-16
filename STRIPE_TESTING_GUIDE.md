# 🧪 Complete Stripe Testing Guide

## 🚀 Quick Start Testing (5 Minutes)

### 1. **Test the Pricing Page**
```bash
# Make sure your dev server is running
npm run dev
```
- Go to `http://localhost:3000/pricing`
- **Not logged in**: Both buttons should say "Sign up"
- **Logged in**: Free plan says "Start Training", Premier says "Subscribe Now"

### 2. **Test User Authentication Flow**
- Sign up for a new account
- Log in
- Go back to pricing page
- Verify buttons change to show "Subscribe Now"

### 3. **Test Basic Stripe Checkout**
- Click "Subscribe Now" on Premier plan  
- Should redirect to Stripe checkout
- **If you get an error**: Check your API keys and price ID

## 🔧 Environment Setup Check

### **Verify Environment Variables**
```bash
# Check your .env.local file
cat .env.local | grep STRIPE
```

Should show:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (optional for basic testing)
```

### **Test Stripe Keys**
Run this in your browser console on the pricing page:
```javascript
// Check if Stripe keys are loaded
console.log('Stripe key present:', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
```

## 💳 End-to-End Payment Testing

### **Step 1: Complete a Test Payment**
1. **Start checkout**: Click "Subscribe Now"
2. **Use test card**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Any name
3. **Complete payment**
4. **Check redirect**: Should go to `/success` page

### **Step 2: Verify Database Update**
Check your Supabase database:
```sql
-- Run this in Supabase SQL editor
SELECT 
  id, email, paidUser, premium, 
  stripe_customer_id, subscription_status,
  created_at
FROM profiles 
WHERE email = 'your-test-email@example.com';
```

**Expected result**: `paidUser` should be `true`

### **Step 3: Test Premium Access**
- Go to `/selection` 
- You should now see all premium poses
- Check if premium features are unlocked

## 🔍 Testing Different Scenarios

### **Test Card Numbers**
```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002  
🔐 3D Secure: 4000 0025 0000 3155
💳 Insufficient funds: 4000 0000 0000 9995
```

### **Test User States**
1. **New user** → Sign up → Subscribe → Should work
2. **Existing free user** → Subscribe → Should work  
3. **Already subscribed user** → Try to subscribe again → Should be blocked

## 🪝 Webhook Testing (Advanced)

### **Option 1: Use ngrok (Recommended)**
```bash
# Install ngrok
npm install -g ngrok

# In terminal 1: Start your app
npm run dev

# In terminal 2: Expose your local server
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and:
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://abc123.ngrok.io/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy webhook secret to `.env.local`

### **Option 2: Test Without Webhooks (Simple)**
The success page will update the user status as a backup, so you can test without webhooks initially.

## 🐛 Common Issues & Solutions

### **"Unauthorized" Error**
```bash
# Check if user is logged in
# Go to browser dev tools → Application → Cookies
# Look for supabase auth cookies
```

### **"Invalid Price ID" Error**
Update the price ID in `pricing/page.tsx`:
```typescript
// Make sure this matches your Stripe dashboard
priceId: 'price_1RlWvcP00bfYJmLE1WJaRrvl'
```

### **Webhook Not Working**
```bash
# Check webhook endpoint in browser
curl http://localhost:3000/api/webhooks/stripe
# Should return 400 (missing signature) - this means endpoint exists
```

### **Database Not Updating**
```sql
-- Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('paidUser', 'stripe_customer_id');
```

## 🎯 Step-by-Step Test Checklist

### **Phase 1: Basic Functionality**
- [ ] Pricing page loads
- [ ] Buttons change based on auth state  
- [ ] Checkout session creates successfully
- [ ] Redirects to Stripe

### **Phase 2: Payment Flow**
- [ ] Test card payment succeeds
- [ ] Redirects to success page
- [ ] Success page shows confirmation
- [ ] Database updates `paidUser = true`

### **Phase 3: Premium Features**
- [ ] User can access premium poses
- [ ] Analytics show premium status
- [ ] App recognizes paid user

### **Phase 4: Edge Cases**
- [ ] Already subscribed user blocked
- [ ] Declined payment handled gracefully
- [ ] Webhook handles subscription changes

## 🔄 Quick Database Reset (For Testing)

```sql
-- Reset user to free tier (for retesting)
UPDATE profiles 
SET 
  paidUser = false,
  premium = false,
  stripe_customer_id = NULL,
  subscription_status = 'inactive'
WHERE email = 'your-test-email@example.com';
```

## 📊 Monitoring & Debugging

### **Check Stripe Dashboard**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Payments** → See successful test payments
3. **Customers** → See created customers
4. **Subscriptions** → See active subscriptions
5. **Webhooks** → See webhook delivery attempts

### **Check Application Logs**
```bash
# In your terminal running npm run dev
# Look for console.log messages like:
# "✅ Successfully activated premium for user: [user-id]"
```

### **Check Supabase Logs**
1. Go to Supabase dashboard
2. **Logs** → **API** → Look for profile updates

## 🚨 Emergency Testing Commands

### **Manual User Activation**
```sql
-- If webhook fails, manually activate user
UPDATE profiles 
SET 
  paidUser = true,
  premium = true,
  subscription_status = 'active',
  stripe_customer_id = 'cus_manual_test'
WHERE email = 'your-email@example.com';
```

### **Check Integration Status**
```sql
-- Verify everything is connected
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE paidUser = true) as paid_users,
  COUNT(*) FILTER (WHERE stripe_customer_id IS NOT NULL) as stripe_linked
FROM profiles;
```

## ✅ Success Criteria

Your integration is working if:
- ✅ Payment completes in Stripe
- ✅ User redirects to success page  
- ✅ `paidUser` column updates to `true`
- ✅ User can access premium features
- ✅ Subscription appears in Stripe dashboard

## 🎉 You're Ready!

Once you can complete a test payment and see `paidUser = true` in your database, your integration is working perfectly! 🚀 
# 💳 Stripe Integration Setup Guide

## 🎯 Overview
This guide will help you complete the Stripe payment integration for your Yotion.ai pricing page.

## ✅ What's Already Done
- ✅ Dynamic pricing page with authentication-aware buttons
- ✅ Proper user state management with `useUser` hook
- ✅ API route structure for Stripe checkout (`/api/create-checkout-session`)
- ✅ Loading states and error handling
- ✅ Responsive design with proper UX

## 🔧 Next Steps to Complete Stripe Integration

### 1. Install Stripe SDK
```bash
npm install stripe @stripe/stripe-js
```

### 2. Set Up Environment Variables
Add these to your `.env.local`:
```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Your site URL for redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Create Stripe Product & Price
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create a new product: "Yotion.ai Premier"
3. Add a recurring price: $10/month
4. Copy the price ID (starts with `price_`)
5. Update the `priceId` in the pricing page

### 4. Update the API Route
Replace the placeholder code in `app/api/create-checkout-session/route.ts`:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  // ... existing auth code ...

  const { priceId } = await request.json();

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId, // Your actual Stripe price ID
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    metadata: {
      userId: user.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
```

### 5. Create Success Page
Create `app/success/page.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Update user's paid status in database
      updateUserPaidStatus();
    }
  }, [sessionId]);

  const updateUserPaidStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ paidUser: true })
        .eq('id', user.id);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to Premier! 🎉</h1>
      <p className="text-lg mb-8">Your subscription is now active.</p>
      <a href="/selection" className="bg-blue-500 text-white px-6 py-3 rounded-lg">
        Start Your Premium Training
      </a>
    </div>
  );
}
```

### 6. Add Webhook Handling (Recommended)
Create `app/api/webhooks/stripe/route.ts` to handle subscription events:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        const supabase = await createClient();
        await supabase
          .from('profiles')
          .update({ paidUser: true })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

## 🧪 Testing

### Test Mode Setup
1. Use Stripe test keys (start with `pk_test_` and `sk_test_`)
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Test Flow
1. Click "Subscribe Now" on Premier plan
2. Should redirect to Stripe Checkout
3. Complete payment with test card
4. Should redirect back to success page
5. User should now have Premier access

## 🚀 Going Live
1. Get live Stripe keys from dashboard
2. Update environment variables
3. Set up webhook endpoint in Stripe dashboard
4. Test with real payment methods

## 🔐 Security Notes
- Never expose secret keys in client-side code
- Always validate webhooks with signatures
- Use HTTPS in production
- Implement proper error handling

## 📊 Features You Can Add Later
- Proration for plan changes
- Usage-based billing
- Coupons and discounts
- Customer portal for subscription management
- Multiple pricing tiers
- Annual billing with discounts

Your dynamic pricing page is now ready - just complete the Stripe setup and you'll have a fully functional payment system! 🎉 
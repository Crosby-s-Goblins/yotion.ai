import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile to check for existing Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, username')
      .eq('id', user.id)
      .single();

    // Parse request body with error handling
    let requestBody;
    try {
      const text = await request.text();
      if (!text) {
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
      }
      requestBody = JSON.parse(text);
    } catch (error) {
      console.error("JSON parsing error:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { priceId } = requestBody;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    let customerId = profile?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile?.username || user.email!.split('@')[0],
        metadata: {
          supabase_user_id: user.id,
          supabase_email: user.email!,
        },
      });
      
      customerId = customer.id;

      // Store the Stripe customer ID in Supabase
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
      
      console.log('Created new Stripe customer:', customerId, 'for user:', user.id);
    } else {
      console.log('Using existing Stripe customer:', customerId, 'for user:', user.id);
    }

    // Check for existing active subscriptions
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session with proper customer linking
    const session = await stripe.checkout.sessions.create({
      customer: customerId, // Use customer ID instead of just email
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        supabase_user_id: user.id,
        supabase_email: user.email!,
        price_id: priceId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          supabase_email: user.email!,
        },
      },
    });

    console.log('Created checkout session:', session.id, 'for user:', user.id, 'customer:', customerId);

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
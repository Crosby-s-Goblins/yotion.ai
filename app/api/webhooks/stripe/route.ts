import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    // If webhook secret is configured, verify signature
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log('✅ Webhook signature verified');
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // For testing: parse event directly (NOT recommended for production)
      console.log('⚠️ Running webhook without signature verification (test mode)');
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('Failed to parse webhook body:', err);
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    }

    const supabase = await createClient();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const userEmail = session.metadata?.supabase_email;

        console.log('Processing checkout.session.completed:', {
          sessionId: session.id,
          userId,
          userEmail,
          customerId: session.customer,
          paymentStatus: session.payment_status
        });

        if (userId && session.payment_status === 'paid') {
          // Verify user exists in Supabase
          const { data: existingUser, error: userError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('id', userId)
            .single();

          if (userError || !existingUser) {
            console.error('User not found in Supabase:', userId, userError);
            return NextResponse.json({ error: 'User not found' }, { status: 400 });
          }

          // Get subscription details
          const subscription = await stripe.subscriptions.list({
            customer: session.customer as string,
            status: 'active',
            limit: 1,
          });

          const subscriptionId = subscription.data[0]?.id;

          // Update user premium status with only existing columns
          const updateData = {
            paidUser: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_created_at: new Date().toISOString(),
          };
          
          console.log('Attempting to update user with data:', updateData);
          
          const { error: updateError, data: updateResult } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select(); // Add select to see what was actually updated

          if (updateError) {
            console.error('❌ Error updating user premium status:', {
              error: updateError,
              userId,
              updateData,
              errorCode: updateError.code,
              errorMessage: updateError.message,
              errorDetails: updateError.details
            });
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
          }

          console.log('✅ Successfully activated premium for user:', userId);
          console.log('✅ Update result:', updateResult);
          
          // Optional: Send confirmation email or notification here
          
        } else {
          console.warn('Checkout session completed but conditions not met:', {
            userId,
            paymentStatus: session.payment_status,
            customerId: session.customer
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.supabase_user_id;

        console.log('Processing subscription deletion:', {
          subscriptionId: subscription.id,
          customerId,
          userId
        });

        // Try to find user by stripe customer ID if userId not in metadata
        const updateFilter: { id?: string; stripe_customer_id?: string } = {};
        if (userId) {
          updateFilter.id = userId;
        } else {
          updateFilter.stripe_customer_id = customerId;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            paidUser: false,
            subscription_status: 'cancelled',
            subscription_cancelled_at: new Date().toISOString(),
          })
          .match(updateFilter);

        if (updateError) {
          console.error('Error deactivating premium:', updateError);
        } else {
          console.log('✅ Successfully deactivated premium for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.supabase_user_id;
        const status = subscription.status;

        console.log('Processing subscription update:', {
          subscriptionId: subscription.id,
          customerId,
          userId,
          status
        });

        // Try to find user by stripe customer ID if userId not in metadata
        const updateFilter: { id?: string; stripe_customer_id?: string } = {};
        if (userId) {
          updateFilter.id = userId;
        } else {
          updateFilter.stripe_customer_id = customerId;
        }

        const isActive = status === 'active';
        const updateData: { 
          subscription_status: string; 
          paidUser: boolean; 
          stripe_subscription_id: string; 
        } = {
          subscription_status: status,
          paidUser: isActive,
          stripe_subscription_id: subscription.id,
        };

        // Note: Period end tracking can be added later if needed

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .match(updateFilter);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
        } else {
          console.log('✅ Successfully updated subscription for customer:', customerId, 'to:', status);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        console.log('Payment failed for customer:', customerId);
        
        // Optional: Handle payment failures (send email, update status, etc.)
        // You might want to give users a grace period before deactivating
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 
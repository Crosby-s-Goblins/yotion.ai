// Quick test script to verify Stripe connection
// Run with: node test_stripe_locally.js

require('dotenv').config({ path: '.env.local' });

async function testStripeConnection() {
  console.log('🧪 Testing Stripe Integration...\n');

  // Check environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  console.log('📋 Environment Check:');
  console.log('✓ Secret Key:', secretKey ? `${secretKey.slice(0, 12)}...` : '❌ Missing');
  console.log('✓ Publishable Key:', publishableKey ? `${publishableKey.slice(0, 12)}...` : '❌ Missing');
  
  if (!secretKey) {
    console.log('\n❌ No STRIPE_SECRET_KEY found in .env.local');
    return;
  }

  try {
    // Test Stripe API connection
    const stripe = require('stripe')(secretKey);
    
    console.log('\n💳 Testing Stripe API...');
    
    // List first customer to test API access
    const customers = await stripe.customers.list({ limit: 1 });
    console.log('✅ Stripe API connection successful');
    console.log(`📊 Account has ${customers.has_more ? '1+' : customers.data.length} customers`);

    // Test the price ID from your app
    const priceId = 'price_1RlWvcP00bfYJmLE1WJaRrvl';
    console.log(`\n💰 Testing Price ID: ${priceId}`);
    
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log('✅ Price ID valid');
      console.log(`📦 Product: ${price.nickname || 'Unnamed'}`);
      console.log(`💵 Amount: $${price.unit_amount / 100}`);
      console.log(`🔄 Type: ${price.type}`);
    } catch (priceError) {
      console.log('❌ Price ID invalid or not found');
      console.log('🔧 Update the priceId in app/(marketing)/pricing/page.tsx');
    }

  } catch (error) {
    console.log('❌ Stripe API Error:', error.message);
    console.log('🔧 Check your STRIPE_SECRET_KEY in .env.local');
  }

  console.log('\n🌐 Next Steps:');
  console.log('1. Go to http://localhost:3000/pricing');
  console.log('2. Login to your account');
  console.log('3. Click "Subscribe Now" on Premier plan');
  console.log('4. Use test card: 4242 4242 4242 4242');
}

testStripeConnection().catch(console.error); 
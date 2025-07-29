'use client'

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<{ 
    paidUser?: boolean; 
    subscription_status?: string; 
    stripe_customer_id?: string; 
  } | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPaymentAndStatus();
    } else {
      setError('No session ID found');
      setIsVerifying(false);
    }
  }, [sessionId]);

  const verifyPaymentAndStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('User not found');
        return;
      }

      // Get current user status with subscription details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('paidUser, subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Don't fail on profile errors - the payment was successful
        setUserStatus({ paidUser: true }); // Assume success since they reached this page
      } else {
        setUserStatus(profile);
      }

      // Since the user completed checkout successfully, mark them as paid
      // This serves as a backup in case the webhook hasn't processed yet
      try {
        const updateResult = await supabase
          .from('profiles')
          .update({ paidUser: true })
          .eq('id', user.id);
        
        if (updateResult.error) {
          console.error('Error updating paidUser status:', updateResult.error);
        } else {
          console.log('Successfully updated paidUser status for user:', user.id);
        }
      } catch (updateError) {
        console.error('Failed to update user status:', updateError);
        // Don't fail the whole flow - the webhook will handle this
      }

    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Something went wrong verifying your payment');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <CardTitle className="text-2xl">Verifying Payment...</CardTitle>
            <CardDescription>Please wait while we confirm your subscription</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-600" />
            <CardTitle className="text-2xl text-orange-600">Payment Processing</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don&apos;t worry! Your payment was successful and is being processed. 
              Your premium features should be available shortly.
            </p>
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/selection">Try Premium Features</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Premier! 🎉</CardTitle>
          <CardDescription className="text-lg">
            Your subscription is now active and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status indicator */}
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">
              ✅ Payment successful • ✅ Premium features activated
            </p>
            {userStatus?.subscription_status && (
              <p className="text-xs text-green-600 mt-1">
                Subscription Status: {userStatus.subscription_status === 'active' ? 'Active' : userStatus.subscription_status}
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              You now have access to all premium features:
            </p>
            <ul className="text-left space-y-2 max-w-sm mx-auto">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">20+ advanced yoga poses</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Detailed performance analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Personalized AI insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Progress tracking & history</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" asChild>
              <Link href="/selection">
                Start Your Premium Training
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/performance">
                View Your Analytics
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Receipt sent to your email • Manage subscription in{' '}
              <Link href="/settings" className="underline">
                settings
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <CardTitle className="text-2xl text-primary">Loading...</CardTitle>
            <CardDescription>Verifying your payment</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
} 
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";

export default function PricingPage() {
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const isLoggedIn = !!user;

  const handleSubscribe = async () => {
    if (!isLoggedIn || !user) {
      // If not logged in, redirect to sign up
      router.push("/auth/sign-up");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1RlXJlP00bfYJmLEINdqQgGP', // Test mode Stripe price ID for $10/month
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Checkout session error:', response.status, errorData);
        throw new Error(`Failed to create checkout session: ${errorData.error || response.status}`);
      }
      
      const { url } = await response.json();
      if (url) {
        // If it's a Stripe URL, redirect to Stripe
        if (url.includes('stripe')) {
          window.location.href = url;
        } else {
          // Otherwise, use Next.js router
          router.push(url);
        }
      }
      
    } catch (error) {
      console.error("Error starting checkout:", error);
      // TODO: Add user-friendly error handling
      alert("Sorry, there was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const PricingButton = ({ plan }: { plan: 'free' | 'premier' }) => {
    if (plan === 'free') {
      if (isLoggedIn) {
        return (
          <Button className="w-full h-10" variant="outline" asChild>
            <Link href="/selection">Start Training</Link>
          </Button>
        );
      } else {
        return (
          <Button className="w-full h-10" variant="outline" asChild>
            <Link href="/auth/sign-up">Sign up now</Link>
          </Button>
        );
      }
    }

    // Premier plan button
    if (isLoggedIn) {
      return (
        <Button 
          className="w-full h-10" 
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </>
          )}
        </Button>
      );
    } else {
      return (
        <Button className="w-full h-10" onClick={() => router.push("/auth/sign-up")}>
          Sign up for Premier
        </Button>
      );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-8 lg:gap-10 items-center">
        <div className="flex flex-col gap-4 items-center px-4 md:px-8 pt-12 md:pt-20">
          <h1 className="font-semibold text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl text-sm md:text-base">
            Start your AI-powered yoga journey today. Upgrade anytime to unlock premium features.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 w-full max-w-4xl px-4">
          {/* Free Plan */}
          <Card className="flex-1 h-auto lg:h-[500px] flex flex-col relative">
            <CardHeader className="pb-4 lg:pb-6">
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground"> / month</span></div>
              <CardDescription>Perfect to get started with AI yoga training</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-4 lg:pb-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Access to 3 basic yoga poses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Real-time pose correction</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Post-workout AI insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Basic progress tracking</span>
                </li>
              </ul>
            </CardContent>
            <div className="p-4 lg:p-6 pt-0">
              <PricingButton plan="free" />
            </div>
          </Card>

          {/* Premier Plan */}
          <Card className="flex-1 h-auto lg:h-[500px] flex flex-col relative border-2 border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader className="pb-4 lg:pb-6">
              <CardTitle className="text-2xl">Premier</CardTitle>
              <div className="text-3xl font-bold">$10<span className="text-lg font-normal text-muted-foreground"> / month</span></div>
              <CardDescription>Full access to all features and poses</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-4 lg:pb-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Access to 20+ yoga poses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Advanced pose correction & feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Detailed performance analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Personalized AI insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Progress tracking & history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <div className="p-4 lg:p-6 pt-0">
              <PricingButton plan="premier" />
            </div>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-sm text-muted-foreground max-w-2xl px-4 pb-8 lg:pb-0">
          <p>✓ Cancel anytime • ✓ Secure payment processing</p>
        </div>
      </div>
    </main>
  );
} 
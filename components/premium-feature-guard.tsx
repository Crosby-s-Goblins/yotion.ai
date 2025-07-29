'use client'

import { useEffect, useState } from 'react';
import { getCurrentUserAccess, UserProfile, getSubscriptionInfo } from '@/lib/supabase/user-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

interface SubscriptionInfo {
  hasAccess: boolean;
  status: string;
  displayStatus: string;
  canUpgrade: boolean;
  isActive: boolean;
  isCancelled: boolean;
  isPastDue: boolean;
  isTrialing: boolean;
}


/**
 * Component that protects premium features
 * Usage: <PremiumFeatureGuard>...</PremiumFeatureGuard>
 */
export function PremiumFeatureGuard({ 
  children, 
  fallback, 
  featureName = "premium feature" 
}: PremiumFeatureGuardProps) {
  const [userAccess, setUserAccess] = useState<{
    hasAccess: boolean;
    profile: UserProfile | null;
    subscriptionInfo: SubscriptionInfo;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserAccess().then((access) => {
      setUserAccess(access);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded"></div>;
  }

  // User has premium access - show the protected content
  if (userAccess?.hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show upgrade prompt or custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
          <Crown className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-lg">Premium Feature</CardTitle>
        <CardDescription>
          Unlock {featureName} with a Premium subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild className="w-full">
          <Link href="/pricing">
            Upgrade to Premium
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Simple hook for checking premium access
 * Usage: const { hasAccess, subscriptionInfo } = usePremiumAccess();
 */
export function usePremiumAccess() {
  const [userAccess, setUserAccess] = useState<{
    hasAccess: boolean;
    subscriptionInfo: SubscriptionInfo;
  }>({
    hasAccess: false,
    subscriptionInfo: getSubscriptionInfo(null),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserAccess().then((access) => {
      setUserAccess({
        hasAccess: access.hasAccess,
        subscriptionInfo: access.subscriptionInfo,
      });
      setLoading(false);
    });
  }, []);

  return { ...userAccess, loading };
}

/**
 * Component to display subscription status
 * Usage: <SubscriptionStatus />
 */
export function SubscriptionStatus() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hasAccess, subscriptionInfo, loading } = usePremiumAccess();

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>;
  }

  const getStatusColor = () => {
    if (subscriptionInfo.isActive) return 'text-green-600 bg-green-50 border-green-200';
    if (subscriptionInfo.isPastDue) return 'text-red-600 bg-red-50 border-red-200';
    if (subscriptionInfo.isCancelled) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = () => {
    if (subscriptionInfo.isActive) return <Crown className="w-3 h-3" />;
    if (subscriptionInfo.isPastDue) return <AlertTriangle className="w-3 h-3" />;
    if (subscriptionInfo.isCancelled) return <Lock className="w-3 h-3" />;
    return <Lock className="w-3 h-3" />;
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {getStatusIcon()}
      {subscriptionInfo.displayStatus}
    </div>
  );
} 
import { createClient } from './client';

export interface UserProfile {
  paidUser: boolean;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  subscription_created_at: string | null;
  subscription_cancelled_at: string | null;
}

/**
 * Check if user has premium access
 * Primary logic: Use paidUser boolean for access control
 * Secondary: subscription_status for edge cases and admin
 */
export function hasPremiumAccess(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  // Primary access control: paidUser boolean
  return profile.paidUser === true;
}

/**
 * Get detailed subscription info for UI/admin purposes
 */
export function getSubscriptionInfo(profile: UserProfile | null) {
  if (!profile) {
    return {
      hasAccess: false,
      status: 'no_subscription',
      displayStatus: 'Free User',
      canUpgrade: true,
    };
  }

  const hasAccess = hasPremiumAccess(profile);
  const status = profile.subscription_status || 'unknown';
  
  let displayStatus = 'Free User';
  let canUpgrade = true;
  
  if (hasAccess) {
    switch (status) {
      case 'active':
        displayStatus = 'Premium Active';
        canUpgrade = false;
        break;
      case 'trialing':
        displayStatus = 'Premium Trial';
        canUpgrade = false;
        break;
      case 'past_due':
        displayStatus = 'Payment Issue';
        canUpgrade = false;
        break;
      case 'cancelled':
        displayStatus = 'Premium (Ending Soon)';
        canUpgrade = true;
        break;
      default:
        displayStatus = 'Premium';
        canUpgrade = false;
    }
  }

  return {
    hasAccess,
    status,
    displayStatus,
    canUpgrade,
    isActive: status === 'active',
    isCancelled: status === 'cancelled',
    isPastDue: status === 'past_due',
    isTrialing: status === 'trialing',
  };
}

/**
 * Fetch current user's premium status
 */
export async function getCurrentUserAccess() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      user: null,
      profile: null,
      hasAccess: false,
      subscriptionInfo: getSubscriptionInfo(null),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('paidUser, subscription_status, stripe_customer_id, subscription_created_at, subscription_cancelled_at')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return {
      user,
      profile: null,
      hasAccess: false,
      subscriptionInfo: getSubscriptionInfo(null),
    };
  }

  return {
    user,
    profile,
    hasAccess: hasPremiumAccess(profile),
    subscriptionInfo: getSubscriptionInfo(profile),
  };
} 
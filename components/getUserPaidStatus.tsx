'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useUser } from './user-provider';


// Custom hook to get the paid status of the current logged-in user.
export function useUserPaidStatus(): boolean | null {
  const user = useUser() as { id?: string } | null;
  const [paidStatus, setPaidStatus] = useState<boolean | null>(null);
  useEffect(() => {
    if (user) {
      const supabase = createClient();
      supabase
        .from('profiles')
        .select('paidUser')
        .eq('id', user.id)
        .single()
        .then(({ data: profileData }) => {
          if (profileData) setPaidStatus(!!profileData.paidUser);
        });
    } else {
      setPaidStatus(null);
    }
  }, [user]);
  return paidStatus;
}
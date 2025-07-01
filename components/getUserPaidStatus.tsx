'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useUser } from './user-provider';


// Returns a boolean status from the current logged-in user's profile.
export async function getUserStatus(): Promise<boolean | null> {
  const user = useUser();
  const [paidStatus, setPaidStatus] = useState<any>(null);
  useEffect(() => {
    if (user) {
      const supabase = createClient();
      supabase
        .from('profiles')
        .select('paidUser')
        .eq('id', user.id)
        .single()
        .then(({ data: profileData }) => {
          if (profileData) setPaidStatus(profileData.paidUser);
        });
    } else {
      setPaidStatus(null);
    }
  }, [user]);
  return paidStatus ?? null;
}
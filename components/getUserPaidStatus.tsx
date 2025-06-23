'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';


// Returns a boolean status from the current logged-in user's profile.
export async function getUserStatus(): Promise<boolean | null> {

    const [user, setUser] = useState<any>(null);
    const [paidStatus, setPaidStatus] = useState<any>(null);

    const supabase = createClient();
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // get profile info
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select("paidUser")
            .eq('id', user.id)
            .single();
          if (profileData) setPaidStatus(profileData);
        } else {
          setPaidStatus(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    

  return paidStatus.paidUser ?? null;
}
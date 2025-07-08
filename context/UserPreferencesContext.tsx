'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchUserPreferences } from '@/lib/supabase/fetchUserPreferences';

type UserPreferences = {
  default_timer: number | undefined;
  tts_enabled: boolean | undefined;
  reminders: boolean | undefined;
  motivation: boolean | undefined;
};

type PreferencesContextType = {
  preferences: UserPreferences | null;
  loading: boolean;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences | null>>;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setPreferences(data);
      }

      setLoading(false);
    };

    loadPrefs();
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, loading, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('useUserPreferences must be used within PreferencesProvider');
  return context;
};

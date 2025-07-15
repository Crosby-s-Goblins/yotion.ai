'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type TTSContextType = {
  ttsEnabled: boolean;
  setTTSEnabled: (enabled: boolean) => void;
};

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export function TTSProvider({ children }: { children: React.ReactNode }) {
  const [ttsEnabled, setTTSEnabled] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadTTSSetting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('tts_enabled')
        .eq('id', user.id)
        .single();

      if (!error && data?.tts_enabled !== undefined) {
        setTTSEnabled(data.tts_enabled);
        localStorage.setItem('tts', String(data.tts_enabled));
      } else {
        // fallback to localStorage if no DB value found
        const stored = localStorage.getItem('tts');
        if (stored !== null) {
          setTTSEnabled(stored === 'true');
        }
      }
    };

    loadTTSSetting();
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem('tts', String(ttsEnabled));
  }, [ttsEnabled]);

  return (
    <TTSContext.Provider value={{ ttsEnabled, setTTSEnabled }}>
      {children}
    </TTSContext.Provider>
  );
}

export function useTTS() {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
}
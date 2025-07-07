'use client'

import { createContext, useContext, useState, useEffect } from 'react';

type TTSContextType = {
  ttsEnabled: boolean;
  setTTSEnabled: (enabled: boolean) => void;
};

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export function TTSProvider({ children }: { children: React.ReactNode }) {
  const [ttsEnabled, setTTS] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tts');
      if (stored !== null) {
        setTTS(stored === 'true');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tts', String(ttsEnabled));
    }
  }, [ttsEnabled]);

  return (
    <TTSContext.Provider value={{ ttsEnabled, setTTSEnabled: setTTS }}>
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
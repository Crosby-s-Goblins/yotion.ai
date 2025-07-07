"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type TimerContextType = {
  timerSeconds: number;
  setTimerSeconds: (val: number) => void;
  isLoaded: boolean;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("timerSeconds");
      if (stored !== null) {  // safer check in case '0' or 'false'
        setTimerSeconds(parseInt(stored, 10));
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem("timerSeconds", timerSeconds.toString());
    }
  }, [timerSeconds, isLoaded]);

  return (
    <TimerContext.Provider value={{ timerSeconds, setTimerSeconds, isLoaded }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within TimerProvider");
  return context;
};

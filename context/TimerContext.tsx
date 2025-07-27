"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useUserPreferences } from "./UserPreferencesContext";


type TimerContextType = {
  timerSeconds: number;
  setTimerSeconds: (val: number) => void;
  isLoaded: boolean;
  resetTimerToDefault: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null); // null until loaded
  const [isLoaded, setIsLoaded] = useState(false);
  const { preferences, loading } = useUserPreferences();

  // On mount: load timerSeconds from localStorage if present; else preferences default
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading) return; // Wait until preferences are loaded

    const stored = localStorage.getItem("timerSeconds");
    if (stored !== null) {
      setTimerSeconds(parseInt(stored, 10));
      setIsLoaded(true);
    } else if (preferences?.default_timer !== undefined) {
      setTimerSeconds(preferences.default_timer);
      setIsLoaded(true);
    } else {
      setTimerSeconds(60);
      setIsLoaded(true);
    }
  }, [loading, preferences]);

  // Update localStorage whenever timerSeconds changes (after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && timerSeconds !== null) {
      localStorage.setItem("timerSeconds", timerSeconds.toString());
    }
  }, [timerSeconds, isLoaded]);

  // Helper to reset to default timer (called only on "selection page" mount)
  const resetTimerToDefault = () => {
    if (!loading && preferences?.default_timer !== undefined) {
      setTimerSeconds(preferences.default_timer);
      localStorage.removeItem("timerSeconds"); // clear saved choice so default loads next time
    }
  };

  return (
    <TimerContext.Provider value={{ timerSeconds: timerSeconds ?? 60, setTimerSeconds, isLoaded, resetTimerToDefault }}>
      {children}
    </TimerContext.Provider>
  );
};


export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within TimerProvider");
  return context;
};

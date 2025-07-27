'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Types for the context state
interface ProgramSessionState {
  posesIn: string[];
  poseTiming: number[];
  currentPoseIndex: number;
  timeInCorrectPosition: number[];
  accuracy: number[];
  isComplete: boolean;
}

interface ProgramSessionContextType extends ProgramSessionState {
  initializeSession: (posesIn: string[], poseTiming: number[]) => void;
  nextPose: () => void;
  setTimeInCorrectForPose: (seconds: number) => void;
  updateAccuracy: (accuracy: number) => void;
  resetSession: () => void;
}

const defaultState: ProgramSessionState = {
  posesIn: [],
  poseTiming: [],
  currentPoseIndex: 0,
  timeInCorrectPosition: [],
  accuracy: [],
  isComplete: false,
};

const STORAGE_KEY = 'programSessionState';

const ProgramSessionContext = createContext<ProgramSessionContextType | undefined>(undefined);

export const ProgramSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgramSessionState>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...defaultState, ...JSON.parse(stored) };
        } catch {}
      }
    }
    return defaultState;
  });

  // Persist to localStorage on state change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Initialize session with program data
  const initializeSession = useCallback((posesIn: string[], poseTiming: number[]) => {
    setState({
      posesIn,
      poseTiming,
      currentPoseIndex: 0,
      timeInCorrectPosition: Array(posesIn.length).fill(0),
      accuracy: Array(posesIn.length).fill(0),
      isComplete: false,
    });
  }, []);

  // Move to next pose or complete session
  const nextPose = useCallback(() => {
    setState(prev => {
      if (prev.currentPoseIndex < prev.posesIn.length - 1) {
        return { ...prev, currentPoseIndex: prev.currentPoseIndex + 1 };
      } else {
        return { ...prev, isComplete: true };
      }
    });
  }, []);

  // Update time in correct position for the current pose
  const setTimeInCorrectForPose = useCallback((seconds: number) => {
    setState(prev => {
      const updated = [...prev.timeInCorrectPosition];
      updated[prev.currentPoseIndex] = seconds;
      return { ...prev, timeInCorrectPosition: updated };
    });
  }, []);

  // Update accuracy for current pose
  const updateAccuracy = useCallback((accuracy: number) => {
    setState(prev => {
      const updated = [...prev.accuracy];
      updated[prev.currentPoseIndex] = accuracy;
      return { ...prev, accuracy: updated };
    });
  }, []);

  // Reset session (clear localStorage)
  const resetSession = useCallback(() => {
    setState(defaultState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <ProgramSessionContext.Provider
      value={{
        ...state,
        initializeSession,
        nextPose,
        setTimeInCorrectForPose,
        updateAccuracy,
        resetSession,
      }}
    >
      {children}
    </ProgramSessionContext.Provider>
  );
};

// Hook to use the context
export function useProgramSession() {
  const ctx = useContext(ProgramSessionContext);
  if (!ctx) throw new Error('useProgramSession must be used within a ProgramSessionProvider');
  return ctx;
} 
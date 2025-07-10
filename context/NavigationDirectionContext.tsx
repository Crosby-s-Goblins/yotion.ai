'use client'

import React, { createContext, useContext, useState, ReactNode } from "react";
import { flushSync } from "react-dom";

export type NavigationDirection = "forward" | "backward" | "none";

interface NavigationDirectionContextType {
  direction: NavigationDirection;
  setDirection: (dir: NavigationDirection) => void;
}

const NavigationDirectionContext = createContext<NavigationDirectionContextType | undefined>(undefined);

export function NavigationDirectionProvider({ children }: { children: ReactNode }) {
  const [direction, setDirection] = useState<NavigationDirection>("none");
  return (
    <NavigationDirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </NavigationDirectionContext.Provider>
  );
}

export function useNavigationDirection() {
  const ctx = useContext(NavigationDirectionContext);
  if (!ctx) throw new Error("useNavigationDirection must be used within NavigationDirectionProvider");
  return ctx;
} 
"use client";

import { ReactNode } from "react";
import { TimerProvider } from "@/context/TimerContext";

export function TimerProviderWrapper({ children }: { children: ReactNode }) {
  return <TimerProvider>{children}</TimerProvider>;
}

'use client'

import { useMemo } from "react";

interface timingInd{
    duration : Number
}

export function BreathIndication({ duration } : timingInd) {
  // Memoize the animation style so it updates if duration changes
  const animationStyle = useMemo(() => ({
    animation: `bounce-vertical ${duration}s ease-in-out infinite`,
  }), [duration]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative h-72 w-24">
        {/* Vertical Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-black/60"></div>

        {/* Bouncing Ball */}
        <div
          className="absolute left-1/2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg transition-all ease-in-out -translate-x-1/2"
          style={animationStyle}
        ></div> {/* May want to change style choices here */}
      </div>

      {/* Tailwind custom keyframes */}
      <style jsx>{`
        @keyframes bounce-vertical {
          0% {
            top: 100%;
          }
          50% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </main>
  );
}
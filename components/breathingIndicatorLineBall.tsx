'use client'

import { useMemo } from "react";

interface timingInd{
    duration : number
}

export function BreathIndication({ duration } : timingInd) {
  // Memoize the animation style so it updates if duration changes
  const animationStyle = useMemo(() => ({
    animation: `bounce-vertical ${duration}s ease-in-out infinite`,
  }), [duration]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Vertical Line with Ball */}
      <div className="relative" style={{ height: '300px' }}>
        {/* Vertical line */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 w-2 bg-white/60 rounded-full"
          style={{ height: '300px', top: '0px' }}
        />
        {/* Moving ball */}
        <div 
          className="absolute left-1/2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg transition-all ease-in-out -translate-x-1/2"
          style={animationStyle}   
        />
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
    </div>
  );
}
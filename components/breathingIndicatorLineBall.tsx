'use client'

import { useEffect } from "react";

interface timingInd{
    duration : number
}

export function BreathIndication({ duration } : timingInd) {
  // Inject CSS animation into the document head
  useEffect(() => {
    const styleId = 'breathing-animation-style';
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new style
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .breathing-ball {
        animation: breathing-move ${duration}s ease-in-out infinite;
      }
      
      @keyframes breathing-move {
        0% {
          top: calc(100% - 12px);
        }
        50% {
          top: 0%;
        }
        100% {
          top: calc(100% - 12px);
        }
      }
      
      @media (min-width: 640px) {
        @keyframes breathing-move {
          0% {
            top: calc(100% - 16px);
          }
          50% {
            top: 0%;
          }
          100% {
            top: calc(100% - 16px);
          }
        }
      }
      
      @media (min-width: 1024px) {
        @keyframes breathing-move {
          0% {
            top: calc(100% - 16px);
          }
          50% {
            top: 0%;
          }
          100% {
            top: calc(100% - 16px);
          }
        }
      }
    `;
    
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [duration]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Vertical Line with Ball */}
      <div className="relative h-48 sm:h-64 lg:h-80">
        {/* Vertical line */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 w-1.5 sm:w-2 bg-white/60 rounded-full"
          style={{ height: '100%', top: '0px' }}
        />
        {/* Moving ball */}
        <div 
          className="absolute left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg breathing-ball"
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
}
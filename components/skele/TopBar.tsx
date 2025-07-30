import React from 'react';
import { RotateCcw, X, InfoIcon, Image as ImageIcon } from "lucide-react";
import { Button } from '@/components/ui/button';

interface TopBarProps {
  timerSecondMove: number | null;
  isLoaded: boolean;
  formatTime: (seconds: number) => string;
  onExit: () => void;
  onShowInfo: () => void;
  onToggleImageRef: () => void;
  onReset: () => void;
  showImageRef: boolean;
  isPauseLocked: boolean;
}

export function TopBar({
  timerSecondMove,
  isLoaded,
  formatTime,
  onExit,
  onShowInfo,
  onToggleImageRef,
  onReset,
  showImageRef,
  isPauseLocked
}: TopBarProps) {
  return (
    <div className="flex justify-center items-center gap-4 px-10 pt-4 pb-4 w-full max-w-6xl mx-auto pointer-events-auto">
      {/* Top Left Exit Button */}
      <div className="absolute top-4 left-10 z-20 h-24 flex items-center pointer-events-auto">
        <Button
          onClick={onExit}
          size="icon"
          className="w-16 h-16 bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Exit session"
        >
          <X className="w-10 h-10" />
        </Button>
      </div>
      
      {/* Top Right Info Button */}
      <div className="absolute top-4 right-10 z-20 h-24 flex items-center pointer-events-auto">
        <Button
          onClick={onShowInfo}
          size="icon"
          className="w-16 h-16 bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Show info"
        >
          <InfoIcon className="w-10 h-10" />
        </Button>
      </div>
      
      {/* Top Bar (centered row) */}
      <div className="flex justify-center items-center gap-4 px-10 h-24 w-full max-w-6xl mx-auto pointer-events-auto">
        {/* Image Ref Toggle Button (left of timer) */}
        <Button
          onClick={onToggleImageRef}
          size="icon"
          className="w-16 h-16 bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={showImageRef ? "Hide pose reference" : "Show pose reference"}
        >
          <ImageIcon className="w-10 h-10" />
        </Button>
        
        {/* Timer */}
        <div className="px-10 py-4 rounded-full bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl flex items-center justify-center">
          {timerSecondMove !== null && isLoaded ? (
            <p className="text-6xl font-extrabold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent tracking-widest">
              {formatTime(timerSecondMove)}
            </p>
          ) : (
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>
        
        {/* Reset Button (right of timer) */}
        <Button
          onClick={onReset}
          disabled={isPauseLocked}
          size="icon"
          className="w-16 h-16 bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Reset session"
        >
          <RotateCcw className="w-10 h-10" />
        </Button>
      </div>
    </div>
  );
}
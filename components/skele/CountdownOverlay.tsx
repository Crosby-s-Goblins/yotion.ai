import React from 'react';

interface CountdownOverlayProps {
  timerStarted: number;
  poseStartTimer: number;
}

export function CountdownOverlay({ timerStarted, poseStartTimer }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full pointer-events-none">
      {timerStarted === 1 ? (
        <h1 className="text-white text-9xl font-bold opacity-75 drop-shadow-lg">{poseStartTimer}</h1>
      ) : null}
    </div>
  );
}
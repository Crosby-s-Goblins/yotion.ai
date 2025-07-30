import React from 'react';

interface CountdownOverlayProps {
  formText: string;
  timerStarted: number;
  poseStartTimer: number;
}

export function CountdownOverlay({ formText, timerStarted, poseStartTimer }: CountdownOverlayProps) {
  return (
    <div className="absolute flex justify-center top-1/2 w-full h-full">
      {formText !== "" ? (
        <h1 className="m-3 text-white text-4xl font-bold drop-shadow-lg">{formText}</h1>
      ) : (
        timerStarted === 1 ? (
          <h1 className="m-3 text-white text-9xl font-bold opacity-75 drop-shadow-lg">{poseStartTimer}</h1>
        ) : (
          <h1 className="m-3 text-white text-4xl font-bold"> {/* Literally just an else condition, LEAVE EMPTY */} </h1>
        )
      )}
    </div>
  );
}
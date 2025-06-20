'use client';

import { Info, Play, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function SkelePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);

  // Breathing animation
  useEffect(() => {
    const inhaleDuration = 4000; // 4 seconds inhale
    const exhaleDuration = 4000; // 4 seconds exhale
    const interval = 50; // Update every 50ms
    
    const timer = setInterval(() => {
      setBreathProgress(prev => {
        const currentDuration = breathingPhase === 'inhale' ? inhaleDuration : exhaleDuration;
        const newProgress = prev + (interval / currentDuration);
        
        if (newProgress >= 1) {
          setBreathingPhase(prevPhase => prevPhase === 'inhale' ? 'exhale' : 'inhale');
          return 0;
        }
        
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Calculate circle size based on breathing phase
  const getCircleSize = () => {
    if (breathingPhase === 'inhale') {
      // Grow from 60px to 120px during inhale
      return 60 + (breathProgress * 60);
    } else {
      // Shrink from 120px to 60px during exhale
      return 120 - (breathProgress * 60);
    }
  };

  const circleSize = getCircleSize();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Camera Container - Full viewport */}
      <div className="absolute inset-0 bg-gray-400">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      </div>

      {/* UI Overlay - Absolute positioned on top */}
      <div className="absolute inset-0 z-10">
        {/* Breathing Indicator - Left Side */}
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2">
          <div className="flex flex-col items-center">
            {/* Vertical Line with Ball */}
            <div className="relative" style={{ height: '300px' }}>
              {/* Vertical line */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 w-2 bg-white/60 rounded-full"
                style={{ height: '300px', top: '0px' }}
              />
              
              {/* Moving ball */}
              <div 
                className="absolute w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white/40 shadow-lg transition-all duration-300 ease-in-out"
                style={{ 
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  top: `${0 + (breathProgress * 300)}px`
                }}
              />
              
              {/* Top and bottom markers */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/20 rounded-full" />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Top UI Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div className="flex text-white px-4 py-2 rounded-lg w-1/3 justify-start">
            </div>
            <div className="flex text-white px-4 py-2 rounded-lg w-1/3 justify-center">
                <p className="text-black text-4xl font-semibold">0:43</p>
            </div>
            <div className="flex text-white px-4 py-2 rounded-lg w-1/3 justify-end">
                <div className="bg-black/50 text-white px-4 py-4 rounded-full">
                    <Info className="w-8 h-8" />
                </div>
            </div>
        </div>

        {/* Bottom UI Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="bg-black/50 text-white px-12 py-4 rounded-full flex items-center justify-center gap-4">
                <p className="text-2xl">Reset</p>
                <RotateCcw className="w-8 h-8"/>
            </div>
        </div>

        {/* Center UI */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg">
            Center overlay
          </div>
        </div>
      </div>
    </div>
  );
}

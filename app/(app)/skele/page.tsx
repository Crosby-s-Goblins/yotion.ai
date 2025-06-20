'use client';

import { Info, Play, RotateCcw, Camera, CameraOff, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function SkelePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);

  // Start camera
  const startCamera = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user' // Use front camera
        }
      });
      
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

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
  }, [breathingPhase]);

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
          className="w-full h-full object-cover transform scale-x-[-1]"
          autoPlay
          playsInline
          muted
        />
        
        {/* Loading/Error overlay */}
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              {isLoading ? (
                <>
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg">Accessing camera...</p>
                </>
              ) : (
                <>
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-4">Camera not available</p>
                  {error && (
                    <p className="text-red-400 text-sm mb-4 max-w-md mx-auto">{error}</p>
                  )}
                  <button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
                  >
                    <Camera className="w-4 h-4" />
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}
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
                <div className="bg-black/75 text-white px-4 py-4 rounded-full">
                    <X className="w-8 h-8" />
                </div>
            </div>
            <div className="bg-black/75 text-white px-6 py-4 rounded-full flex items-center justify-center">
                <p className="text-2xl">0:48</p>
            </div>
            <div className="flex text-white px-4 py-2 rounded-lg w-1/3 justify-end">
                <div className="bg-black/75 text-white px-4 py-4 rounded-full">
                    <Info className="w-8 h-8" />
                </div>
            </div>
        </div>

        {/* Bottom UI Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div className="bg-black/75 text-white px-12 py-4 rounded-full flex items-center justify-center gap-4">
                <p className="text-2xl">Reset</p>
                <RotateCcw className="w-8 h-8"/>
            </div>
        </div>
      </div>
    </div>
  );
}

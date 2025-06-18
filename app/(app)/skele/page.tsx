'use client';

import { Info, Play, RotateCcw } from "lucide-react";
import { useState, useRef } from "react";

export default function SkelePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Camera Container - Full viewport */}
      <div className="absolute inset-0">
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
        {/* Top UI Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div className="flex text-white px-4 py-2 rounded-lg w-1/3 justify-start">
                <p className="text-black">Test 1</p>
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

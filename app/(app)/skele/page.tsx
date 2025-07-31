'use client'

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePoseCorrection } from "@/components/poseCorrection";
import { BreathIndication } from "@/components/breathingIndicatorLineBall";
import { useTimer } from "@/context/TimerContext";
import { useUser } from "@/components/user-provider";
import { useProgramSession } from '@/context/ProgramSessionContext';

// Extracted hooks
import { useCameraManager } from '@/components/skele/useCameraManager';
import { useTimerManager } from '@/components/skele/useTimerManager';
import { usePoseManager } from '@/components/skele/usePoseManager';
import { usePerformanceTracker } from '@/components/skele/usePerformanceTracker';

// Extracted UI components
import { CameraView } from '@/components/skele/CameraView';
import { TopBar } from '@/components/skele/TopBar';
import { InfoModal } from '@/components/skele/InfoModal';
import { PoseReferenceImage } from '@/components/skele/PoseReferenceImage';
import { CountdownOverlay } from '@/components/skele/CountdownOverlay';
import { AnalyzingLoader } from '@/components/skele/AnalyzingLoader';

function SkelePageContent() {
  const user = useUser() as { id?: string } | null;
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showImageRef, setShowImageRef] = useState(false);
  const { isLoaded, timerSeconds } = useTimer();
  const searchParams = useSearchParams();
  
  // --- Program session integration ---
  const programSession = useProgramSession();
  const isProgramActive = programSession && programSession.posesIn.length > 0;
  
  // Determine poseId, isReversed, and timerForPose
  let poseId, isReversed, timerForPose;
  if (isProgramActive) {
    const poseEntry = programSession.posesIn[programSession.currentPoseIndex];
    if (typeof poseEntry === 'string' && poseEntry.endsWith('R')) {
      poseId = poseEntry.slice(0, -1);
      isReversed = true;
    } else {
      poseId = poseEntry;
      isReversed = false;
    }
    timerForPose = programSession.poseTiming[programSession.currentPoseIndex];
  } else {
    poseId = searchParams.get('poseId');
    const reverseParam = searchParams.get('reverse');
    isReversed = reverseParam === 'true';
    timerForPose = timerSeconds;
  }
  
  const [go] = useState(true);

  // Initialize custom hooks
  const camera = useCameraManager();
  const pose = usePoseManager(poseId);
  
  const timer = useTimerManager({
    poseId,
    timerForPose,
    isProgramActive,
    correctPose: () => false, // Temporary placeholder
    isLoaded,
    isCameraOn: camera.isCameraOn,
  });
  
  const {
    videoRef: poseVideoRef,
    canvasRef,
    score,
    setScore,
    correctPose,
    stop,
  } = usePoseCorrection(Number(poseId || 0), timer.timerStartedRef, isReversed);
  
  // Update timer manager with actual correctPose function
  useEffect(() => {
    timer.updateCorrectPose(correctPose);
  }, [timer.updateCorrectPose, correctPose]);
  
  const performance = usePerformanceTracker({
    timerSecondMove: timer.timerSecondMove,
    go,
    score,
    heldPercentage: timer.heldPercentage,
    initialTimerSeconds: timer.initialTimerSeconds,
    totalHeldSeconds: timer.totalHeldSeconds,
    poseId,
    userId: user?.id,
    isProgramActive,
    programSession,
  });
  
  // Sync camera videoRef with pose correction videoRef
  useEffect(() => {
    if (camera.videoRef.current && poseVideoRef.current !== camera.videoRef.current) {
      (poseVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = camera.videoRef.current;
    }
  }, [camera.videoRef, poseVideoRef]);

  // Event handlers
  const handleExit = () => {
    stop();
    window.location.href = '/selection';
  };
  
  const handleReset = () => {
    timer.handleResetStopwatch();
    setScore(100);
  };


  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Camera Container */}
      <CameraView
        videoRef={camera.videoRef as React.RefObject<HTMLVideoElement>}
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        isCameraOn={camera.isCameraOn}
        isLoading={camera.isLoading}
        error={camera.error}
        startCamera={camera.startCamera}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
        {/* Top Bar */}
        <TopBar
          timerSecondMove={timer.timerSecondMove}
          isLoaded={isLoaded}
          formatTime={timer.formatTime}
          onExit={handleExit}
          onShowInfo={() => setShowInfoModal(true)}
          onToggleImageRef={() => setShowImageRef(v => !v)}
          onReset={handleReset}
          showImageRef={showImageRef}
          isPauseLocked={timer.isPauseLocked}
        />
        
        {/* Breathing Indicator - Left Side */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-white/80 rounded-full shadow-2xl border border-white/40">
            <div className="w-16 h-96 drop-shadow-2xl flex items-center justify-center">
              <BreathIndication duration={10} />
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="flex items-end justify-between px-10 pb-8 w-full max-w-6xl mx-auto pointer-events-auto">
          <div className="w-1/3" />
        </div>
      </div>

      {/* Pose Reference Image */}
      <PoseReferenceImage
        pose={pose.pose}
        showImageRef={showImageRef}
        isReversed={isReversed}
      />

      {/* Info Modal */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        pose={pose.pose}
        isLoadingPose={pose.isLoadingPose}
        dbError={pose.dbError}
      />

      {/* Countdown Overlay */}
      <CountdownOverlay
        timerStarted={timer.timerStarted}
        poseStartTimer={timer.poseStartTimer}
      />
      
      {/* Analyzing Loader */}
      {performance.analyzing && (
        <AnalyzingLoader 
          isProgramActive={!!isProgramActive} 
          programSession={programSession} 
        />
      )}
    </div>
  );
}

export default function SkelePage() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium">Loading Session...</p>
      </div>
    }>
      <SkelePageContent />
    </Suspense>
  );
}


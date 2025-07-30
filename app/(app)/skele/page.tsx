'use client'

import { RotateCcw, Camera, X, InfoIcon, Image as ImageIcon } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useStopwatch } from "react-timer-hook";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pose } from "@/components/selectorCardComponents/types";
import { usePoseCorrection } from "@/components/poseCorrection";
import { BreathIndication } from "@/components/breathingIndicatorLineBall";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/context/TimerContext";
import { useUser } from "@/components/user-provider";
import { useProgramSession } from '@/context/ProgramSessionContext';
import Image from 'next/image';

function SkelePageContent() {
  const user = useUser() as { id?: string } | null;
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [pose, setPose] = useState<Pose | null>(null);
  const [isLoadingPose, setIsLoadingPose] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const { timerSeconds, setTimerSeconds, isLoaded } = useTimer();
  const searchParams = useSearchParams(); // Always call at the top
  // --- Program session integration ---
  const programSession = useProgramSession(); // Always call the hook
  const isProgramActive = programSession && programSession.posesIn.length > 0;
  // Determine poseId, isReversed, and timerForPose
  let poseId, isReversed, timerForPose;
  if (isProgramActive) {
    // Program mode: use context for poseId, reverse, and timing
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
    // Single-pose mode: use URL params and user preference/default for timer
    poseId = searchParams.get('poseId');
    const reverseParam = searchParams.get('reverse');
    isReversed = reverseParam === 'true';
    // Timer: check for timer param, else user preference, else 60
    const timerParam = searchParams.get('timer');
    timerForPose = timerParam ? Number(timerParam) : (typeof timerSeconds === 'number' ? timerSeconds : 60);
  }
  // Now safe to initialize timerSecondMove
  const [timerSecondMove, setTimerSecondMove] = useState<number>(60);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState<number | null>(null);
  const [poseStartTimer, setPoseStartTimer] = useState<number>(3); // changed from 3 to 1 for testing purposes
  const [timerStarted, setTimerStarted] = useState<number>(0);
  const timerStartedRef = useRef(timerStarted);
  const [showImageRef, setShowImageRef] = useState(false);
  const hasSubmittedRef = useRef(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Set the timer for the current pose whenever poseId or timerForPose changes
  useEffect(() => {
    if (timerForPose && typeof setTimerSeconds === 'function') {
      setTimerSeconds(timerForPose);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poseId, timerForPose]);

  // Set timerSecondMove to the correct value immediately in program mode
  useEffect(() => {
    if (isProgramActive && typeof timerForPose === 'number') {
      setTimerSecondMove(timerForPose);
    } else if (typeof timerSeconds === 'number') {
      setTimerSecondMove(timerSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poseId, timerForPose, isProgramActive, timerSeconds, programSession]);

  // After determining isProgramActive, poseId, etc.
  useEffect(() => {
    if (!isProgramActive) {
      const stored = localStorage.getItem('timerSeconds');
      console.log('Skele page: read timerSeconds from localStorage:', stored);
      if (stored !== null) {
        setTimerSeconds(Number(stored));
        console.log('Skele page: setTimerSeconds to', Number(stored));
      }
    }
    // eslint-disable-next-line
  }, []);

  // Use Number(poseId) directly for current pose
  const [go] = useState(true);

  const stopwatch = useStopwatch({ autoStart: false, interval: 20 });
  const wasPoseCorrectRef = useRef(false);
  const [analyzing, setAnalyzing] = useState(false);
  const pauseLockRef = useRef(false); //Locking mechanism for flicker-prevention on resets

  const {
    formText,
    videoRef,
    canvasRef,
    score,
    setScore,
    correctPose,
    stop,
  } = usePoseCorrection(Number(poseId), timerStartedRef, isReversed);

  const router = useRouter();

  useEffect(() => {
    router.prefetch('/post_workout');
  }, [router]);

 useEffect(() => {
  let frameId: number;

  const checkPoseAndUpdate = () => {
    if (pauseLockRef.current || timerStarted !== 2) {
      frameId = requestAnimationFrame(checkPoseAndUpdate);
      return;
    }

    const isCorrect = correctPose();

    // Only start on transition from incorrect to correct
    if (isCorrect && !wasPoseCorrectRef.current && !stopwatch.isRunning) {
      stopwatch.start();
    } else if (!isCorrect && wasPoseCorrectRef.current && stopwatch.isRunning) {
      stopwatch.pause();
    }
    wasPoseCorrectRef.current = isCorrect;

    frameId = requestAnimationFrame(checkPoseAndUpdate);
  };

  frameId = requestAnimationFrame(checkPoseAndUpdate);

  return () => cancelAnimationFrame(frameId);
}, [correctPose, stopwatch, timerStarted, poseId, isProgramActive, programSession]);



  const handleResetStopwatch = useCallback(() => {
    stopwatch.pause();
    stopwatch.reset(undefined, false); // Reset to zero, do not autostart
    setScore(100);
    setTimerStarted(0);
    timerStartedRef.current = 0;
    setPoseStartTimer(3);
    setTimerSecondMove(isProgramActive ? timerForPose : timerSeconds);
    hasSubmittedRef.current = false;
  }, [stopwatch, setScore, setTimerStarted, timerSeconds, isProgramActive, timerForPose]);

  useEffect(() => {
  if (!isLoaded) return;

  pauseLockRef.current = true;

  stop();
  handleResetStopwatch();

  hasSubmittedRef.current = false;

  setTimeout(() => {
    pauseLockRef.current = false;
  }, 1000);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isLoaded]);

  useEffect(() => {
    timerStartedRef.current = timerStarted;
  }, [timerStarted]);

  // Calculate total held seconds and percentage
  const totalHeldSeconds = stopwatch.minutes * 60 + stopwatch.seconds + stopwatch.milliseconds / 1000;
  let heldPercentage = 0;
  if (initialTimerSeconds && initialTimerSeconds > 0) {
    heldPercentage = (totalHeldSeconds / initialTimerSeconds) * 100;
  }

  useEffect(() => {
    const pushData = async () => {
      const supabase = createClient();

      const cappedConsistency = Math.min(Math.round(heldPercentage * 100), 10000);
      const { error } = await supabase
        .from('post_performance')
        .insert({
          user_id: user?.id,
          exercises_performed: [Number(poseId)],
          accuracy_score: Math.round(score * 100),
          consistency_score: cappedConsistency,
          duration_s: initialTimerSeconds,
        });

      if (error) {
        console.error('Failed to insert performance data:', error);
      } else {
        console.log('Performance data inserted!');
        hasSubmittedRef.current = true; // Set immediately to prevent further inserts
      }
    };

    if (
      typeof timerSecondMove === 'number' &&
      timerSecondMove <= 0 &&
      go &&
      !hasSubmittedRef.current &&
      !hasNavigated // Prevent double navigation
    ) {
      hasSubmittedRef.current = true; // Set immediately to prevent further inserts
      setAnalyzing(true);
      setHasNavigated(true); // Prevent further navigation

      (async () => {
        try {
          // await stopCameraAndPose();
          if (isProgramActive && programSession) {
            // Update per-pose accuracy and time in correct position
            programSession.updateAccuracy(Math.round(score * 100));
            stopwatch.pause();
            programSession.setTimeInCorrectForPose(totalHeldSeconds);
            // Program mode: advance to next pose or finish
            if (programSession.currentPoseIndex < programSession.posesIn.length - 1) {
              // Get the next pose entry BEFORE incrementing
              const nextEntry = programSession.posesIn[programSession.currentPoseIndex + 1];
              let nextPoseId = nextEntry;
              let nextReverse = false;
              if (typeof nextEntry === 'string' && nextEntry.endsWith('R')) {
                nextPoseId = nextEntry.slice(0, -1);
                nextReverse = true;
              }
              console.log('[DEBUG] Before nextPose, currentPoseIndex:', programSession.currentPoseIndex);
              programSession.nextPose();
              // Navigate to the next pose with id and reverse in the URL
              const url = nextReverse ? `/skele?poseId=${nextPoseId}&reverse=true` : `/skele?poseId=${nextPoseId}`;
              window.location.href = url;
            } else {
              // Program complete: calculate and store summary
              // Manually build arrays including the just-recorded values for the last pose
              const updatedAccuracy = [...programSession.accuracy];
              updatedAccuracy[programSession.currentPoseIndex] = Math.round(score * 100);

              const updatedTimeInCorrect = [...programSession.timeInCorrectPosition];
              updatedTimeInCorrect[programSession.currentPoseIndex] = totalHeldSeconds;

              const poseNumbers = programSession.posesIn.map(p => {
                if (typeof p === 'string' && p.endsWith('R')) return Number(p.slice(0, -1));
                return Number(p);
              });
              const totalTime = programSession.poseTiming.reduce((a, b) => a + b, 0);
              // Use updatedTimeInCorrect for totalCorrect
              const totalCorrect = updatedTimeInCorrect.reduce((a, b) => a + b, 0);
              let avgConsistency = totalTime > 0 ? Math.round((totalCorrect / totalTime) * 10000) : 0;
              if (avgConsistency > 10000) avgConsistency = 10000;
              // Use updatedAccuracy for avgAccuracy (time-weighted average)
              let avgAccuracy = 0;
              if (totalTime > 0 && updatedAccuracy.length === programSession.poseTiming.length) {
                let weightedSum = 0;
                for (let i = 0; i < updatedAccuracy.length; i++) {
                  weightedSum += updatedAccuracy[i] * programSession.poseTiming[i];
                }
                avgAccuracy = Math.round(weightedSum / totalTime);
              }
              // Store in post_performance
              const supabase = createClient();
              (async () => {
                await supabase.from('post_performance').insert({
                  user_id: user?.id,
                  exercises_performed: poseNumbers,
                  accuracy_score: avgAccuracy,
                  consistency_score: avgConsistency,
                  duration_s: totalTime,
                });
              })();
              router.replace('/post_workout');
            }
          } else {
            // Single-pose mode: insert after each pose
            await pushData();
            router.replace('/post_workout');
          }
        } catch (err) {
          console.error("Cleanup failed:", err);
          setAnalyzing(false);
        }
      })();
    }
  }, [timerSecondMove, go, initialTimerSeconds, poseId, score, heldPercentage, user?.id, isProgramActive, programSession, hasNavigated, router]);

  useEffect(() => {
    const fetchPose = async () => {
      const numericPoseId = Number(poseId);
      console.log('Fetching pose with id:', numericPoseId, typeof numericPoseId);
      if (!numericPoseId || isNaN(numericPoseId)) {
        setIsLoadingPose(false);
        setDbError("Invalid pose ID.");
        return;
      }

      setIsLoadingPose(true);
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("poseLibrary")
          .select('id, name, labels->difficulty, description, images')
          .eq('id', numericPoseId)
          .single();

        if (error) {
          setDbError(`Database Error: ${error.message}`);
        } else if (!data) {
          setDbError(`No pose found with ID: ${numericPoseId}.`);
        } else {
          setPose(data);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setDbError(`An unexpected error occurred: ${err.message}`);
        } else {
          setDbError("An unexpected error occurred.");
        }
      } finally {
        setIsLoadingPose(false);
      }
    };

    fetchPose();
  }, [poseId]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "user", // Use front camera
        },
      });

      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    } finally {
      setIsLoading(false);
    }
  }, [videoRef, setIsLoading, setError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }, [videoRef, setIsCameraOn]);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!isCameraOn) return;

    const poseCheckInterval = setInterval(() => {
      if (timerStartedRef.current !== 0) return;

      if (correctPose()) {
        setTimerStarted(1);
      } else {
        setTimerStarted(0);
        setPoseStartTimer(3);
      }
    }, 1000);

    return () => clearInterval(poseCheckInterval);
  }, [isCameraOn, correctPose]);


  //Timer before the "recording" timer
  useEffect(() => {
    if (timerStarted !== 1) return;

    const timerInterval = setInterval(() => {
      if (!correctPose()) {
        clearInterval(timerInterval);
        setPoseStartTimer(3);  // Reset to your starting countdown value
        setTimerStarted(0);    // Reset state or pause timer as needed
        return;
      }
      setPoseStartTimer(prevSeconds => {
        if (prevSeconds > 1) {
          return prevSeconds - 1;
        }
        clearInterval(timerInterval);

        // SYNC START POINT
        stopwatch.pause();
        stopwatch.reset(undefined, false); // Reset to zero, do not autostart
        stopwatch.start();           // scoring timer

        setTimerSecondMove(timerForPose); // total timer
        setInitialTimerSeconds(timerForPose);
        setTimerStarted(2); // move to "running" phase

        return 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timerStarted]);

  // Timer logic
  useEffect(() => {
    if (timerStarted !== 2 || !isLoaded || timerSecondMove === null) return;

    const timerInterval = setInterval(() => {
      setTimerSecondMove(prevSeconds => {
        if (prevSeconds && prevSeconds > 0) {
          return prevSeconds - 1;
        }
        clearInterval(timerInterval);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timerStarted, isLoaded, timerSecondMove]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };


  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Camera Container - Full viewport */}
      <div className="absolute inset-0 bg-gray-400">
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          muted
          playsInline
          className="scale-x-[-1] absolute inset-0 w-full h-full object-cover" // CAN CHANGE *object-contain* TO *object-cover* to remove the stripes
        />
        <canvas
          ref={canvasRef}
          className="scale-x-[-1] absolute inset-0 w-full h-full object-cover" // also change to object-cover here
        />

        {/* Loading/Error overlay */}
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center text-white">
              {isLoading ? (
                <>
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium">Accessing camera...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg mb-4 font-medium">Camera not available</p>
                  {error && (
                    <p className="text-red-400 text-sm mb-6 max-w-md mx-auto">
                      {error}
                    </p>
                  )}
                  <Button
                    onClick={startCamera}
                    className="bg-gradient-to-tr from-primary to-accent text-white px-8 py-4 rounded-full flex items-center gap-2 mx-auto shadow-glass hover:from-primary/90 hover:to-accent/90"
                  >
                    <Camera className="w-4 h-4" />
                    Try Again
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* UI Overlay - Absolute positioned on top */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
        {/* Top Bar */}
        <div className="flex justify-center items-center gap-4 px-10 pt-4 pb-4 w-full max-w-6xl mx-auto pointer-events-auto">
          {/* Top Left Exit Button */}
          <div className="absolute top-4 left-10 z-20 h-24 flex items-center pointer-events-auto">
            <Button
              onClick={() => {
                stop();
                window.location.href = '/selection'}}
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
              onClick={() => setShowInfoModal(true)}
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
              onClick={() => setShowImageRef((v) => !v)}
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
              onClick={() => {
                handleResetStopwatch();
                handleResetStopwatch();
              }}
              disabled={pauseLockRef.current}
              size="icon"
              className="w-16 h-16 bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Reset session"
            >
              <RotateCcw className="w-10 h-10" />
            </Button>
          </div>
        </div>
        {/* Breathing Indicator - Left Side */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-auto">
          <div className=" bg-white/80 rounded-full shadow-2xl border border-white/40">
            <div className="w-16 h-96 drop-shadow-2xl flex items-center justify-center">
              <BreathIndication duration={10} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-end justify-between px-10 pb-8 w-full max-w-6xl mx-auto pointer-events-auto">
          <div className="w-1/3" />
          {/* Pose Reference Image moved to bottom right */}
        </div>
        {/* Animated Pose Reference Image - truly vertically centered */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {pose?.images && (
            <div
              className={`
                absolute top-1/2 right-8 -translate-y-1/2 pointer-events-auto
                transition-all duration-300
                ${showImageRef
                  ? 'opacity-100 scale-100 translate-x-0'
                  : 'opacity-0 scale-95 translate-x-full'}
              `}
              style={{ transitionProperty: 'opacity, transform' }}
            >
              {/* image card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/40 flex flex-col items-center">
                <Image
                  src={pose.images}
                  alt={`${pose.name} reference`}
                  width={224}
                  height={224}
                  className={`w-56 h-56 object-contain rounded-xl border-2 border-white/40 shadow-lg ${isReversed ? 'scale-x-[-1]' : ''}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                  }}
                  unoptimized
                />
                <p className="text-black text-lg text-center mt-2 font-semibold drop-shadow">{pose.name}</p>
              </div>
            </div>
          )}
        </div>
        {/* Score/Debug Panel - low opacity, non-intrusive */}
        {/* <div className="fixed bottom-8 left-8 z-40 pointer-events-none opacity-25">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl px-8 py-6 shadow-2xl border border-white/40 text-2xl font-bold text-black flex flex-col items-end gap-2">
            <span>Score: {Math.round(score * 10) / 100}</span>
            <span className="text-base font-normal">Timer: {`${stopwatch.minutes}:${stopwatch.seconds}:${stopwatch.milliseconds}`}</span>
            <span className="text-base font-normal">isRunning: {`${stopwatch.isRunning}`}</span>
            <span className="text-base font-normal">isPoseCorrect: {`${correctPose()}`}</span>
            {initialTimerSeconds && initialTimerSeconds > 0 && (
              <span className="text-base font-normal">Held Pose: {heldPercentage.toFixed(1)}%</span>
            )}
          </div>
        </div> */}
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowInfoModal(false)}>
          <div
            className="relative bg-white/90 border border-white/40 rounded-2xl p-10 max-w-lg w-full mx-4 shadow-2xl flex flex-col min-h-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              aria-label="Close info modal"
              className="absolute top-6 right-6 w-12 h-12 bg-white/80 text-black border border-white/40 shadow-lg hover:bg-white"
              onClick={() => setShowInfoModal(false)}
            >
              <X className="w-8 h-8" />
            </Button>
            <div className="flex-grow flex flex-col justify-center">
              {isLoadingPose ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading Pose Information...</p>
                  </div>
                </div>
              ) : pose ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent mb-2 drop-shadow">
                      {pose.name}
                    </h2>
                    <p className="text-lg text-black/80 mb-4">{pose.description || "No description available."}</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-black">Instructions</h3>
                      <div className="text-base text-black/80 space-y-2">
                        <p>• Follow the visual indicator on the left side.</p>
                        <p>• Breathe in as the ball moves up.</p>
                        <p>• Breathe out as the ball moves down.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="font-semibold text-red-500">Unable to load pose information.</p>
                    {dbError && <p className="text-sm text-muted-foreground mt-2">{dbError}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-10 pt-6 border-t border-white/40">
              <Button
                onClick={() => setShowInfoModal(false)}
                className="w-full bg-gradient-to-tr from-primary to-accent text-white py-4 px-8 rounded-full font-semibold shadow-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute flex justify-center top-48 w-full h-full">
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
      
      {analyzing && (
        <ProgramNextPoseLoader 
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

function ProgramNextPoseLoader({ isProgramActive, programSession }: { isProgramActive: boolean, programSession: ReturnType<typeof useProgramSession> }) {
  const [nextPoseName, setNextPoseName] = useState<string | null>(null);
  useEffect(() => {
    if (
      isProgramActive &&
      programSession &&
      programSession.currentPoseIndex < programSession.posesIn.length - 1
    ) {
      // Get the next pose id
      const nextEntry = programSession.posesIn[programSession.currentPoseIndex + 1];
      let nextPoseId = nextEntry;
      if (typeof nextEntry === 'string' && nextEntry.endsWith('R')) {
        nextPoseId = nextEntry.slice(0, -1);
      }
      // Fetch the pose name from the database
      (async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('poseLibrary')
          .select('name')
          .eq('id', Number(nextPoseId))
          .single();
        if (!error && data && data.name) {
          setNextPoseName(data.name);
        } else {
          setNextPoseName(null);
        }
      })();
    }
  }, [isProgramActive, programSession]);

  if (
    isProgramActive &&
    programSession &&
    programSession.currentPoseIndex < programSession.posesIn.length - 1 &&
    nextPoseName
  ) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-semibold">Loading next pose: {nextPoseName}. Please hold</h2>
        </div>
      </div>
    );
  }
  // Default analyzing overlay
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-semibold">Analyzing your results...</h2>
        <p className="text-sm text-muted-foreground mt-2">This will only take a moment.</p>
      </div>
    </div>
  );
}
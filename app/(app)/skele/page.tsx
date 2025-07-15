'use client'

import { RotateCcw, Camera, X, InfoIcon, Image as ImageIcon } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pose } from "@/components/selectorCardComponents/types";
import { usePoseCorrection } from "@/components/poseCorrection";
import { BreathIndication } from "@/components/breathingIndicatorLineBall";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTimer } from "@/context/TimerContext";
import { useStopwatch } from "react-timer-hook";
import { useUser } from "@/components/user-provider";

function SkelePageContent() {
  const user = useUser();
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [pose, setPose] = useState<Pose | null>(null);
  const [isLoadingPose, setIsLoadingPose] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const { timerSeconds, isLoaded } = useTimer();
  const [timerSecondMove, setTimerSecondMove] = useState<number | null>(null);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState<number | null>(null);
  const [poseStartTimer, setPoseStartTimer] = useState<number>(1); // changed from 3 to 1 for testing purposes
  const [timerStarted, setTimerStarted] = useState<number>(0);
  const timerStartedRef = useRef(timerStarted);
  const [showImageRef, setShowImageRef] = useState(false);
  const hasSubmittedRef = useRef(false);

  const searchParams = useSearchParams();
  const poseId = searchParams.get('poseId');

  const [selectedPose, setSelectedPose] = useState(Number(poseId));
  const [go, setGo] = useState(true);

  const stopwatch = useStopwatch({ autoStart: false, interval: 20 });
  const [analyzing, setAnalyzing] = useState(false);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  const {
    formText,
    videoRef,
    canvasRef,
    score,
    setScore,
    correctPose,
    stop,
  } = usePoseCorrection(selectedPose, timerStartedRef);

  const [resetFlag, setResetFlag] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/post_workout');
  }, []);

  useEffect(() => {
    if (isLoaded && timerSecondMove === null) {
      setTimerSecondMove(timerSeconds);
      setInitialTimerSeconds(timerSeconds);
    }
    if (correctPose() && !stopwatch.isRunning) {
      stopwatch.start()
      setStopwatchRunning(true);
    }
    if (!correctPose() && stopwatch.isRunning) {
      stopwatch.pause()
      setStopwatchRunning(false);
    }
  }, [isLoaded, timerSeconds, timerSecondMove]);

  const handleResetStopwatch = () => {
  stopwatch.pause();
  stopwatch.reset(undefined, false);
  setStopwatchRunning(false);
};

  useEffect(() => {
  if (resetFlag && isLoaded) {
    setTimerStarted(0);
    setTimerSecondMove(timerSeconds);
    setPoseStartTimer(3);
    handleResetStopwatch(); // ensures both stopwatch and local flag are reset
    setScore(100);
    setResetFlag(false);
  }
}, [resetFlag, isLoaded, timerSeconds]);




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

      const { error } = await supabase
        .from('post_performance')
        .insert({
          user_id: user?.id,
          exercises_performed: [selectedPose],
          accuracy_score: Math.round(score * 100),
          consistency_score: Math.round(heldPercentage * 100),
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
      !hasSubmittedRef.current
    ) {
      hasSubmittedRef.current = true; // Set immediately to prevent further inserts
      setAnalyzing(true);

      (async () => {
        try {
          // await stopCameraAndPose();
          await pushData();
          stop();
          await new Promise((resolve) => setTimeout(resolve, 300));
          router.replace('/post_workout'); // faster than push
        } catch (err) {
          console.error("Cleanup failed:", err);
          setAnalyzing(false);
        }
      })();
    }
  }, [timerSecondMove, go, initialTimerSeconds, selectedPose, score, heldPercentage, user?.id]);

  useEffect(() => {
    const fetchPose = async () => {
      if (!poseId) {
        setIsLoadingPose(false);
        setDbError("No Pose ID was provided in the URL.");
        return;
      }

      setIsLoadingPose(true);
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("poseLibrary")
          .select('id, name, difficulty, description, images')
          .eq('id', poseId)
          .single();

        if (error) {
          setDbError(`Database Error: ${error.message}`);
        } else if (!data) {
          setDbError(`No pose found with ID: ${poseId}.`);
        } else {
          setPose(data);
        }
      } catch (err: any) {
        setDbError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setIsLoadingPose(false);
      }
    };

    fetchPose();
  }, [poseId]);

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
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
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
    }, 200);

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
        setTimerStarted(2);
        return 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timerStarted])

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
  }, [timerStarted]);

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
              onClick={() => setResetFlag(true)}
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
                <img
                  src={pose.images}
                  alt={`${pose.name} reference`}
                  className="w-56 h-56 object-contain rounded-xl border-2 border-white/40 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.parentElement!.style.display = 'none';
                  }}
                />
                <p className="text-black text-lg text-center mt-2 font-semibold drop-shadow">{pose.name}</p>
              </div>
            </div>
          )}
        </div>
        {/* Score/Debug Panel - low opacity, non-intrusive */}
        <div className="fixed bottom-8 left-8 z-40 pointer-events-none opacity-25">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl px-8 py-6 shadow-2xl border border-white/40 text-2xl font-bold text-black flex flex-col items-end gap-2">
            <span>Score: {Math.round(score * 10) / 100}</span>
            <span className="text-base font-normal">Timer: {`${stopwatch.minutes}:${stopwatch.seconds}:${stopwatch.milliseconds}`}</span>
            <span className="text-base font-normal">isRunning: {`${stopwatch.isRunning}`}</span>
            <span className="text-base font-normal">isPoseCorrect: {`${correctPose()}`}</span>
            {initialTimerSeconds && initialTimerSeconds > 0 && (
              <span className="text-base font-normal">Held Pose: {heldPercentage.toFixed(1)}%</span>
            )}
          </div>
        </div>
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-semibold">Analyzing your results...</h2>
            <p className="text-sm text-muted-foreground mt-2">This will only take a moment.</p>
          </div>
        </div>
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

  // const stopCameraAndPose = async () => {
  //   try {
  //     await closePose(); // ensure it's awaited

  //     if (videoRef.current) {
  //       videoRef.current.pause();
  //       videoRef.current.srcObject = null;
  //     }

  //     if (streamRef.current) {
  //       streamRef.current.getTracks().forEach(track => track.stop());
  //       streamRef.current = null;
  //     }

  //   } catch (err) {
  //     console.error("Error in stopCameraAndPose:", err);
  //     throw err; // bubble up to catch in useEffect
  //   }
  // };
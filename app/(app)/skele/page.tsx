// Skele/page.tsx
'use client';

import { Info, Play, RotateCcw, Camera, CameraOff, X } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pose } from "@/components/selectorCardComponents/types";
import { usePoseCorrection } from "@/components/poseCorrection";
import { BreathIndication } from "@/components/breathingIndicatorLineBall";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

function SkelePageContent() {
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [pose, setPose] = useState<Pose | null>(null);
  const [isLoadingPose, setIsLoadingPose] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [poseStartTimer, setPoseStartTimer] = useState<number>(3);
  const [timerStarted, setTimerStarted] = useState<number>(0);
  const timerStartedRef = useRef(timerStarted);

  const searchParams = useSearchParams();
  const poseId = searchParams.get('poseId');

  const [selectedPose, setSelectedPose] = useState(Number(poseId));
  const [go, setGo] = useState(true);
  
  const {
    rightElbowAngleRef,
    leftElbowAngleRef,
    rightKneeAngleRef,
    leftKneeAngleRef,
    rightHipAngleRef,
    leftHipAngleRef,
    rightShoulderAngleRef,
    leftShoulderAngleRef,
    formText,
    videoRef,
    canvasRef,
    closePose,
    correctPose,
    score,
  } = usePoseCorrection(selectedPose, timerStartedRef);

  const [resetFlag, setResetFlag] = useState(false);
  const router = useRouter();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
          const alreadyReloaded = sessionStorage.getItem('reloaded');
  
          if (!alreadyReloaded) {
          sessionStorage.setItem('reloaded', 'true');
          window.location.reload();
          } //Force reload to allow MediaPipe Startup?
          
          return () => {
          sessionStorage.removeItem('reloaded');
          };
      }, []);

  useEffect(() => {
    if (resetFlag) {
      setTimerStarted(0); //Force the timer to be paused
      setTimerSeconds(60); // Reset your logic here
      setPoseStartTimer(3); //Reset pre-pose recording countdown
      setResetFlag(false); // Important: Reset the fla
      // console.log(poseStart);
    }
  }, [resetFlag]);

  useEffect(() => {
    timerStartedRef.current = timerStarted;
  }, [timerStarted]);  

  useEffect(() => {

    if (timerSeconds <= 0 && go) {
      setGo(false);
      stopCameraAndPose().then(() => {
        router.push('/post_workout');
      });
    }
  }, [timerSeconds, go]);

  const stopCameraAndPose = async () => {
    closePose();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }

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
          .select('id, name, difficulty, description, benefits, images')
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
    if (timerStarted !== 2) return;
 
    const timerInterval = setInterval(() => {
      setTimerSeconds(prevSeconds => {
        if (prevSeconds > 0) {
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

  // Safely parse benefits
  let benefitsArray: string[] = [];
  if (pose?.benefits) {
    if (Array.isArray(pose.benefits)) {
      benefitsArray = pose.benefits;
    } else if (typeof pose.benefits === 'string') {
      try {
        const parsed = JSON.parse(pose.benefits);
        if (Array.isArray(parsed)) {
          benefitsArray = parsed;
        }
      } catch (e) {
        console.error("Failed to parse pose benefits:", e);
      }
    }
  }

  // console.log("POSE OBJECT:", pose);

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
                    <p className="text-red-400 text-sm mb-4 max-w-md mx-auto">
                      {error}
                    </p>
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
      <div className="absolute inset-0 z-10 px-8">
        {/* Breathing Indicator - Left Side */}
        <BreathIndication duration={10}/>

        {/* Top UI Bar */}
        <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-8">
          <div className="flex text-white py-2 rounded-lg w-1/3 justify-start">
           <Link href='/selection'>
              <div className="bg-black/75 text-white px-4 py-4 rounded-full">
                <X className="w-8 h-8" />
              </div>
            </Link>
          </div>
          <div className="bg-black/75 text-white px-6 py-4 rounded-full min-w-[120px] text-center">
            <p className="text-2xl font-medium">{formatTime(timerSeconds)}</p>
          </div>
          <div className="flex text-white py-2 rounded-lg w-1/3 justify-end">
            <div 
              className="bg-black/75 text-white px-4 py-4 rounded-full cursor-pointer hover:bg-black/90 transition-colors"
              onClick={() => setShowInfoModal(true)}
            >
              <Info className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Bottom UI Bar */}
        <div className="absolute bottom-4 left-0 w-full flex items-end justify-between px-8 z-20">
          {/* Left Spacer */}
          <div className="w-1/3" />
          {/* Centered Reset Button */}
          <div className="w-1/3 flex justify-center">
            <Button
              onClick={() => setResetFlag(true)}
              className="bg-black/75 text-white px-12 py-8 rounded-full flex items-center justify-center gap-4"
            >
              <p className="text-2xl font-medium">Reset</p>
              <RotateCcw className="w-8 h-8" />
            </Button>
          </div>
          {/* Pose Reference Image (Right) */}
          <div className="w-1/3 flex justify-end">
            {pose?.images && (
              <div className="bg-black/75 rounded-lg p-2 shadow-lg">
                <img
                  src={pose.images}
                  alt={`${pose.name} reference`}
                  className="w-48 h-48 object-contain rounded-lg border-2 border-white/20"
                  onError={(e) => {
                    e.currentTarget.parentElement!.style.display = 'none';
                  }}
                />
                <p className="text-white text-xs text-center mt-1 font-medium">{pose.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowInfoModal(false)}>
          <div 
            className="relative bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl flex flex-col min-h-[480px]" 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex-grow">
              {isLoadingPose ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading Pose Information...</p>
                  </div>
                </div>
              ) : pose ? (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{pose.name}</h2>
                    <p className="text-gray-600">{pose.description || "No description available."}</p>
                  </div>
                  
                  <div className="space-y-6">
                    {benefitsArray.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">Benefits</h3>
                        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                          {benefitsArray.map((benefit, index) => <li key={index}>{benefit}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Instructions</h3>
                      <div className="text-sm text-gray-600 space-y-2">
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
                    {dbError && <p className="text-sm text-gray-500 mt-2">{dbError}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Omit pre-production; testing only */}
      <div className="absolute flex flex-col justify-center items-end w-full h-full"> {/* z-50 */}
        <div>
          <div className="bg-white/90 rounded-lg px-6 py-3 mb-4 shadow text-2xl font-bold text-gray-800">
            Score: {Math.round(score * 100) / 100}
          </div>
        </div>
        <div className="flex flex-col mr-10 bg-white p-8 rounded-lg w-56">
          <span>Right Elbow: {rightElbowAngleRef.current}</span>
          <span>Left Elbow: {leftElbowAngleRef.current}</span>
          <span>Right Knee: {rightKneeAngleRef.current}</span>
          <span>Left Knee: {leftKneeAngleRef.current}</span>
          <span>Right Hip: {rightHipAngleRef.current}</span>
          <span>Left Hip: {leftHipAngleRef.current}</span>
          <span>Right Shoulder: {rightShoulderAngleRef.current}</span>
          <span>Left Shoulder: {leftShoulderAngleRef.current}</span>
        </div>
      </div>

      <div className="absolute flex justify-center top-48 w-full h-full">
        {formText !== "" ? (
          <h1 className="m-3 text-white text-4xl font-bold">{formText}</h1>
        ) : (
          timerStarted === 1 ? (
            <h1 className="m-3 text-white text-9xl font-bold opactiy-75">{poseStartTimer}</h1>
          ) : (
            <h1 className="m-3 text-white text-4xl font-bold"> {/* Literally just an else condition, LEAVE EMPTY */} </h1> 
          )
        )}
      </div>
    </div>
  );
}

export default function SkelePage() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg">Loading Session...</p>
      </div>
    }>
      <SkelePageContent />
    </Suspense>
  );
}

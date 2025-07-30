import { useState, useEffect, useRef, useCallback } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { useTimer } from '@/context/TimerContext';

interface UseTimerManagerProps {
  poseId: string | null;
  timerForPose: number;
  isProgramActive: boolean;
  correctPose: () => boolean;
  isLoaded: boolean;
  isCameraOn: boolean;
}

export function useTimerManager({ 
  poseId, 
  timerForPose, 
  isProgramActive, 
  correctPose: initialCorrectPose, 
  isLoaded,
  isCameraOn 
}: UseTimerManagerProps) {
  const { timerSeconds, setTimerSeconds } = useTimer();
  const [timerSecondMove, setTimerSecondMove] = useState<number>(60);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState<number | null>(null);
  const [poseStartTimer, setPoseStartTimer] = useState<number>(3);
  const [timerStarted, setTimerStarted] = useState<number>(0);
  const timerStartedRef = useRef(timerStarted);
  const pauseLockRef = useRef(false);
  const [isPauseLocked, setIsPauseLocked] = useState(false);
  const wasPoseCorrectRef = useRef(false);
  const correctPoseRef = useRef(initialCorrectPose);

  const stopwatch = useStopwatch({ autoStart: false, interval: 20 });

  // Set the timer for the current pose whenever poseId or timerForPose changes
  useEffect(() => {
    if (timerForPose && typeof setTimerSeconds === 'function') {
      setTimerSeconds(timerForPose);
    }
  }, [poseId, timerForPose, setTimerSeconds]);

  // Set timerSecondMove to the correct value immediately in program mode
  useEffect(() => {
    if (isProgramActive && typeof timerForPose === 'number') {
      setTimerSecondMove(timerForPose);
    } else if (typeof timerSeconds === 'number') {
      setTimerSecondMove(timerSeconds);
    }
  }, [poseId, timerForPose, isProgramActive, timerSeconds]);

  // Load timer from localStorage for non-program mode
  useEffect(() => {
    if (!isProgramActive) {
      const stored = localStorage.getItem('timerSeconds');
      console.log('Skele page: read timerSeconds from localStorage:', stored);
      if (stored !== null) {
        setTimerSeconds(Number(stored));
        console.log('Skele page: setTimerSeconds to', Number(stored));
      }
    }
  }, [isProgramActive, setTimerSeconds]);

  // Update timer ref
  useEffect(() => {
    timerStartedRef.current = timerStarted;
  }, [timerStarted]);

  // Update correctPose function
  const updateCorrectPose = useCallback((newCorrectPose: () => boolean) => {
    correctPoseRef.current = newCorrectPose;
  }, []);

  // Pose detection and timer start logic
  useEffect(() => {
    if (!isCameraOn) return;

    const poseCheckInterval = setInterval(() => {
      // Don't check pose if we're in pause lock or timer is already running
      if (pauseLockRef.current || timerStartedRef.current !== 0) return;

      if (correctPoseRef.current()) {
        setTimerStarted(1);
      } else {
        setTimerStarted(0);
        setPoseStartTimer(3);
      }
    }, 1000);

    return () => clearInterval(poseCheckInterval);
  }, [isCameraOn]);

  // Pre-recording countdown timer
  useEffect(() => {
    if (timerStarted !== 1) return;

    const timerInterval = setInterval(() => {
      // Skip if pause locked
      if (pauseLockRef.current) {
        return;
      }
      
      if (!correctPoseRef.current()) {
        clearInterval(timerInterval);
        setPoseStartTimer(3);
        setTimerStarted(0);
        return;
      }
      
      setPoseStartTimer(prevSeconds => {
        if (prevSeconds > 1) {
          return prevSeconds - 1;
        }
        clearInterval(timerInterval);

        // SYNC START POINT
        stopwatch.pause();
        stopwatch.reset(undefined, false);
        stopwatch.start();

        setTimerSecondMove(timerForPose);
        setInitialTimerSeconds(timerForPose);
        setTimerStarted(2);

        return 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timerStarted, stopwatch, timerForPose]);

  // Main recording timer
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

  // Stopwatch management for pose tracking
  useEffect(() => {
    let frameId: number;

    const checkPoseAndUpdate = () => {
      if (pauseLockRef.current || timerStarted !== 2) {
        frameId = requestAnimationFrame(checkPoseAndUpdate);
        return;
      }

      const isCorrect = correctPoseRef.current();

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
  }, [stopwatch, timerStarted, poseId, isProgramActive]);

  const handleResetStopwatch = useCallback(() => {
    // Set pause lock to prevent interference during reset
    pauseLockRef.current = true;
    setIsPauseLocked(true);
    
    stopwatch.pause();
    stopwatch.reset(undefined, false);
    setTimerStarted(0);
    timerStartedRef.current = 0;
    setPoseStartTimer(3);
    setTimerSecondMove(isProgramActive ? timerForPose : (typeof timerSeconds === 'number' ? timerSeconds : 60));
    
    // Release pause lock after a short delay
    setTimeout(() => {
      pauseLockRef.current = false;
      setIsPauseLocked(false);
    }, 500);
  }, [stopwatch, timerSeconds, isProgramActive, timerForPose]);

  // Reset logic on load - ONLY run once when isLoaded changes
  useEffect(() => {
    if (!isLoaded) return;

    pauseLockRef.current = true;
    setIsPauseLocked(true);
    
    // Reset logic directly to avoid infinite loop
    stopwatch.pause();
    stopwatch.reset(undefined, false);
    setTimerStarted(0);
    timerStartedRef.current = 0;
    setPoseStartTimer(3);
    setTimerSecondMove(isProgramActive ? timerForPose : (typeof timerSeconds === 'number' ? timerSeconds : 60));

    const timeoutId = setTimeout(() => {
      pauseLockRef.current = false;
      setIsPauseLocked(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isLoaded]); // ONLY depend on isLoaded to prevent flickering

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Calculate total held seconds and percentage
  const totalHeldSeconds = stopwatch.minutes * 60 + stopwatch.seconds + stopwatch.milliseconds / 1000;
  let heldPercentage = 0;
  if (initialTimerSeconds && initialTimerSeconds > 0) {
    heldPercentage = (totalHeldSeconds / initialTimerSeconds) * 100;
  }

  return {
    timerSecondMove,
    initialTimerSeconds,
    poseStartTimer,
    timerStarted,
    timerStartedRef,
    stopwatch,
    pauseLockRef,
    isPauseLocked,
    totalHeldSeconds,
    heldPercentage,
    handleResetStopwatch,
    formatTime,
    updateCorrectPose,
  };
}
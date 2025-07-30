import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProgramSession } from '@/context/ProgramSessionContext';

interface UsePerformanceTrackerProps {
  timerSecondMove: number;
  go: boolean;
  score: number;
  heldPercentage: number;
  initialTimerSeconds: number | null;
  totalHeldSeconds: number;
  poseId: string | null;
  userId: string | undefined;
  isProgramActive: boolean;
  programSession: ReturnType<typeof useProgramSession>;
}

export function usePerformanceTracker({
  timerSecondMove,
  go,
  score,
  heldPercentage,
  initialTimerSeconds,
  totalHeldSeconds,
  poseId,
  userId,
  isProgramActive,
  programSession
}: UsePerformanceTrackerProps) {
  const hasSubmittedRef = useRef(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/post_workout');
  }, [router]);

  useEffect(() => {
    const pushData = async () => {
      const supabase = createClient();

      const cappedConsistency = Math.min(Math.round(heldPercentage * 100), 10000);
      const { error } = await supabase
        .from('post_performance')
        .insert({
          user_id: userId,
          exercises_performed: [Number(poseId)],
          accuracy_score: Math.round(score * 100),
          consistency_score: cappedConsistency,
          duration_s: initialTimerSeconds,
        });

      if (error) {
        console.error('Failed to insert performance data:', error);
      } else {
        console.log('Performance data inserted!');
        hasSubmittedRef.current = true;
      }
    };

    if (
      typeof timerSecondMove === 'number' &&
      timerSecondMove <= 0 &&
      go &&
      !hasSubmittedRef.current &&
      !hasNavigated
    ) {
      hasSubmittedRef.current = true;
      setAnalyzing(true);
      setHasNavigated(true);

      (async () => {
        try {
          if (isProgramActive && programSession) {
            // Update per-pose accuracy and time in correct position
            programSession.updateAccuracy(Math.round(score * 100));
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
              await supabase.from('post_performance').insert({
                user_id: userId,
                exercises_performed: poseNumbers,
                accuracy_score: avgAccuracy,
                consistency_score: avgConsistency,
                duration_s: totalTime,
              });
              
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
  }, [timerSecondMove, go, initialTimerSeconds, poseId, score, heldPercentage, userId, isProgramActive, programSession, hasNavigated, router, totalHeldSeconds]);

  const resetSubmission = () => {
    hasSubmittedRef.current = false;
    setHasNavigated(false);
    setAnalyzing(false);
  };

  return {
    analyzing,
    resetSubmission,
  };
}
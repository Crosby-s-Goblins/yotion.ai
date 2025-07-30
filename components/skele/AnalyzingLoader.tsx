import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProgramSession } from '@/context/ProgramSessionContext';

interface AnalyzingLoaderProps {
  isProgramActive: boolean;
  programSession: ReturnType<typeof useProgramSession>;
}

export function AnalyzingLoader({ isProgramActive, programSession }: AnalyzingLoaderProps) {
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
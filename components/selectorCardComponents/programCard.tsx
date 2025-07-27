import { Session } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useProgramSession } from '@/context/ProgramSessionContext';
import { useRouter } from 'next/navigation';

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
} as const;

interface SessionCardProps {
  session: Session;
  locked?: boolean;
}

export const SessionCard = ({ session, locked }: SessionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [poseMap, setPoseMap] = useState<Record<string, string> | null>(null);
  const [loadingPoses, setLoadingPoses] = useState(false);
  const { initializeSession } = useProgramSession();
  const router = useRouter();

  // Calculate total time in seconds
  const totalSeconds = Array.isArray(session.poseTiming)
    ? session.poseTiming.reduce((sum, t) => sum + (typeof t === 'number' ? t : Number(t)), 0)
    : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeString = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  // Fetch poseLibrary and build a map of id -> name
  useEffect(() => {
    if (!expanded) return;
    setLoadingPoses(true);
    const fetchPoses = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('poseLibrary').select('id, name');
      if (error) {
        setPoseMap({});
        setLoadingPoses(false);
        return;
      }
      // id may be number or string, so normalize to string
      const map: Record<string, string> = {};
      (data || []).forEach((pose) => {
        map[String(pose.id)] = pose.name;
      });
      setPoseMap(map);
      setLoadingPoses(false);
    };
    fetchPoses();
  }, [expanded]);

  // Start program: initialize context and navigate
  const handleStartProgram = () => {
    initializeSession(session.posesIn, session.poseTiming);
    // Determine first pose and reverse param
    const firstPose = session.posesIn[0];
    let poseId = firstPose;
    let reverse = false;
    if (typeof firstPose === 'string' && firstPose.endsWith('R')) {
      poseId = firstPose.slice(0, -1);
      reverse = true;
    }
    const url = reverse ? `/skele?poseId=${poseId}&reverse=true` : `/skele?poseId=${poseId}`;
    router.push(url);
  };

  return (
    <>
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative cursor-pointer"
        onClick={() => !locked && setExpanded(true)}
      >
        <div
          className={`bg-card.glass rounded-2xl border border-border/50 shadow-card hover:shadow-glass transition-all duration-200 ${locked ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <div className="p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg leading-snug break-words line-clamp-2 h-12">{session.name}</h3>
              <div className="flex flex-row gap-2 items-start min-w-[56px] justify-end pt-0.5">
                  {session.isUser ? (
                    <div className="px-3 py-1 rounded-full text-xs font-medium h-7 min-w-[56px] flex items-center justify-center text-gray-700 bg-gray-200 border border-gray-300">User</div>
                  ) : (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${difficultyColors[session.difficulty]} h-7 min-w-[56px] flex items-center justify-center`}>
                      {session.difficulty}
                    </div>
                  )}
                </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {timeString}
            </div>
          </div>
        </div>
        {locked && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <div className="text-center text-white">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Premium</p>
              <p className="text-xs opacity-80">Upgrade to unlock</p>
            </div>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {expanded && !locked && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="relative bg-white border border-border/50 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-glass flex flex-col"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setExpanded(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="flex-grow flex flex-col gap-6">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold mb-2">{session.name}</h2>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-4 text-lg">Program Steps</h4>
                  <div className="flex flex-col gap-0 max-h-[19rem] overflow-y-auto rounded-md border border-border/30 bg-gray-50/60 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                    {loadingPoses || !poseMap ? (
                      <div className="text-center text-muted-foreground py-8">Loading poses...</div>
                    ) : (
                      <ol className="divide-y divide-border">
                        {session.posesIn.map((poseId, idx) => {
                          let reversed = false;
                          let id = poseId;
                          if (typeof poseId === 'string' && poseId.endsWith('R')) {
                            reversed = true;
                            id = poseId.slice(0, -1);
                          }
                          const poseName = poseMap[id] || poseId;
                          return (
                            <li key={idx} className="flex items-center justify-between py-4 px-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-5 text-left">{idx + 1}.</span>
                                <span className="font-semibold text-base text-foreground">
                                  {poseName}
                                </span>
                                {reversed && (
                                  <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs font-medium">Reversed</span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                                {session.poseTiming[idx] !== undefined && session.poseTiming[idx] !== null ? (() => {
                                  const totalSec = Number(session.poseTiming[idx]);
                                  const min = Math.floor(totalSec / 60);
                                  const sec = totalSec % 60;
                                  return min > 0 ? `${min}m ${sec.toString().padStart(2, '0')}s` : `${sec}s`;
                                })() : ''}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
              <Button className="w-full h-12 rounded-2xl text-lg mt-4" onClick={handleStartProgram}>
                Start Program
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 
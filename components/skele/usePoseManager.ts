import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Pose } from '@/components/selectorCardComponents/types';

export function usePoseManager(poseId: string | null) {
  const [pose, setPose] = useState<Pose | null>(null);
  const [isLoadingPose, setIsLoadingPose] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

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

  return {
    pose,
    isLoadingPose,
    dbError,
  };
}
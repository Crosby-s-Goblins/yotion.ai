'use client'

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../user-provider";
import { createClient } from "@/lib/supabase/client";

type StatType = "accuracy" | "consistency" | "time" | "poses";

const statLabels: Record<StatType, string> = {
  accuracy: "Accuracy",
  consistency: "Consistency",
  time: "Duration",
  poses: "Total Poses",
};

const Statwheel = () => {
  const user = useUser() as { id?: string } | null;
  const supabase = createClient();

  const [rankStats, setRankStats] = useState<{ label: string; placement: number }[]>([]);
  const [rankIndex, setRankIndex] = useState(0);

  // Auto-rotate rank display
  useEffect(() => {
    const interval = setInterval(() => {
      setRankIndex((prev) => (prev + 1) % rankStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rankStats]);

  // Fetch rank data
  useEffect(() => {
    if (!user?.id) return;

    const fetchAndCalculateRanks = async () => {
      const fromDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { data: sessions, error } = await supabase
        .from("post_performance")
        .select("user_id, accuracy_score, consistency_score, duration_s, exercises_performed, date")
        .gte("date", fromDate);

      if (error || !sessions) return console.error("Error fetching session data:", error);

      // Aggregate stats by user
      const stats: Record<string, { accuracy: number; consistency: number; time: number; poses: number; sessions: number }> = {};

      sessions.forEach((session) => {
        const id = session.user_id;
        if (!id) return;
        if (!stats[id]) {
          stats[id] = { accuracy: 0, consistency: 0, time: 0, poses: 0, sessions: 0 };
        }

        stats[id].accuracy += session.accuracy_score || 0;
        stats[id].consistency += session.consistency_score || 0;
        stats[id].time += session.duration_s || 0;
        stats[id].poses += Array.isArray(session.exercises_performed) ? session.exercises_performed.length : 0;
        stats[id].sessions += 1;
      });

      // Finalize averages
      const entries = Object.entries(stats).map(([id, stat]) => ({
        id,
        accuracy: stat.accuracy / stat.sessions / 100,
        consistency: stat.consistency / stat.sessions / 100,
        time: stat.time,
        poses: stat.poses,
      }));

      const statTypes: StatType[] = ["accuracy", "consistency", "time", "poses"];
      const userRanks: { label: string; placement: number }[] = [];

      for (const type of statTypes) {
        const sorted = [...entries].sort((a, b) => (b[type] ?? 0) - (a[type] ?? 0));
        const index = sorted.findIndex((entry) => entry.id === user.id);
        if (index !== -1) {
          userRanks.push({ label: statLabels[type], placement: index + 1 });
        }
      }

      setRankStats(userRanks);
    };

    fetchAndCalculateRanks();
  }, [user?.id]);

  const current = rankStats[rankIndex];

  return (
    <div className="flex items-center justify-between">
      <div className="overflow-hidden min-h-[64px] flex items-start relative">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <p className="text-sm text-muted-foreground">{current.label} Rank</p>
              <p className="text-3xl font-bold bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
                #{current.placement}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-500/10 to-gray-400/10 flex items-center justify-center">
        <Trophy className="w-6 h-6 text-gray-500" />
      </div>
    </div>
  );
};

export default Statwheel;

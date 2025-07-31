'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../user-provider';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type LeaderboardEntry = {
  id: string;
  name: string;
  accuracy?: number;
  consistency?: number;
  time?: number;
  poses?: number;
};

export default function Leaderboard() {
  const userCtx = useUser() as { id?: string } | null;
  const supabase = createClient();

  const [allStats, setAllStats] = useState<Record<string, LeaderboardEntry>>({});
  const [selectedType, setSelectedType] = useState<'accuracy' | 'consistency' | 'time' | 'poses'>('poses');
  const [sortedData, setSortedData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug user context
  useEffect(() => {
    console.log('User context:', userCtx);
  }, [userCtx]);

  useEffect(() => {
    if (!userCtx?.id) {
      console.log('No user ID yet, skipping fetch');
      setLoading(true);
      return;
    }

    setLoading(true);

    async function fetchStats() {
      try {
        const fromDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        console.log('Fetching sessions from date:', fromDate);

        const { data: sessions, error } = await supabase
          .from('post_performance')
          .select('user_id, accuracy_score, consistency_score, duration_s, exercises_performed, date')
          .gte('date', fromDate);

        if (error) {
          console.error('Error fetching sessions:', error);
          setLoading(false);
          return;
        }
        console.log('Fetched sessions:', sessions);

        const stats: Record<string, LeaderboardEntry> = {};

        sessions?.forEach((session) => {
          const id = session.user_id;
          if (!id) return;

          if (!stats[id]) {
            stats[id] = {
              id,
              name: 'Anonymous',
              accuracy: 0,
              consistency: 0,
              time: 0,
              poses: 0,
            };
          }

          // Count each entry in exercises_performed as one pose
          const posesThisSession = Array.isArray(session.exercises_performed)
            ? session.exercises_performed.length
            : 0;
          stats[id].poses! += posesThisSession;
          stats[id].time! += session.duration_s || 0;
          stats[id].accuracy! += session.accuracy_score || 0;
          stats[id].consistency! += session.consistency_score || 0;
        });

        // Average accuracy and consistency per session count
        Object.values(stats).forEach((entry) => {
          const sessionCount = sessions?.filter((s) => s.user_id === entry.id).length || 1;
          entry.accuracy = parseFloat((((entry.accuracy! || 0) / sessionCount) / 100).toFixed(1));
          entry.consistency = parseFloat((((entry.consistency! || 0) / sessionCount) / 100).toFixed(1));
          // poses is already the total for the week, do not average
        });

        // Debug: log stats after calculation
        console.log('Stats for leaderboard:', stats);

        // Fetch usernames
        const ids = Object.keys(stats).filter(Boolean); // filter out empty/undefined ids
        if (ids.length > 0) {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', ids);

          if (profileError) {
            console.error('Error fetching profiles:', profileError);
          }

          profiles?.forEach((profile) => {
            if (stats[profile.id]) {
              stats[profile.id].name = profile.username || 'Anonymous';
            }
          });
        }

        setAllStats(stats);
      } catch (e) {
        console.error('Unexpected error fetching leaderboard stats:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userCtx?.id, supabase]);

  useEffect(() => {
    const sorted = Object.values(allStats)
      .filter((entry) => typeof entry[selectedType] === 'number')
      .sort((a, b) => (b[selectedType]! || 0) - (a[selectedType]! || 0));

    setSortedData(sorted);
  }, [allStats, selectedType]);

  if (!userCtx) {
    return <div>Loading user...</div>;
  }

  if (loading) {
    return (
      <Card className="bg-card.glass border border-border/50 shadow-card p-4">
        <p>Loading leaderboard...</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card.glass border border-border/50 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
          This Week’s Leaders
        </CardTitle>
        <Select value={selectedType} onValueChange={(val) => setSelectedType(val as "time" | "accuracy" | "consistency" | "poses")}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="poses">Poses</SelectItem>
            <SelectItem value="accuracy">Accuracy</SelectItem>
            <SelectItem value="consistency">Consistency</SelectItem>
            <SelectItem value="time">Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedData.slice(0, 5).map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-background/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600 text-yellow-900'
                    : index === 1
                    ? 'bg-gradient-to-tr from-gray-300 to-gray-500 text-gray-700'
                    : index === 2
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-800 text-amber-100'
                    : 'bg-gradient-to-tr from-gray-100 to-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className={`font-medium ${entry.id === userCtx?.id ? 'text-primary' : ''}`}>
                {entry.name || 'Anonymous'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedType === 'accuracy' || selectedType === 'consistency'
                ? `${entry[selectedType]?.toFixed(1) ?? '0.0'}%`
                : selectedType === 'time'
                ? `${((entry.time || 0) / 60).toFixed(1)} min`
                : selectedType === 'poses'
                ? `${entry.poses ?? 0}`
                : entry[selectedType]}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

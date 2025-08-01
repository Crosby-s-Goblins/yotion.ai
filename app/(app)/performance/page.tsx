'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChartBarWeeklyProgress } from "@/components/ui/chart-bar-label";
import PageTopBar from "@/components/page-top-bar";
import { ChartPiePoseDistribution } from "@/components/ui/chart-pie-label";
import { ChartLineAccuracy, ChartLineConsistency } from "@/components/ui/chart-line-default";
import { useUser } from '@/components/user-provider';

type PerformanceSession = {
  id: string;
  accuracy_score: number;
  date: string;
  exercises_performed: number[];
  consistency_score: number;
};

type Pose = {
  id: number
  name: string
}

function getDateString(date: Date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  // Convert a Date to UTC YYYY-MM-DD string
  const toUTCDateStr = (date: Date) => {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  // Normalize input dates to UTC YYYY-MM-DD strings
  const normalizedDatesSet = new Set(
    dates.map(dateStr => toUTCDateStr(new Date(dateStr)))
  );

  // Start from current date at UTC midnight (today)
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  const todayStr = toUTCDateStr(todayUTC);

  // Check if practiced today
  const practicedToday = normalizedDatesSet.has(todayStr);
  
  let streak = 0;
  const checkDate = new Date(todayUTC);

  // If practiced today, start counting from today
  if (practicedToday) {
    while (true) {
      const checkDateStr = toUTCDateStr(checkDate);
      
      if (!normalizedDatesSet.has(checkDateStr)) {
        break;
      }
      
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }
  } else {
    // If not practiced today, start from yesterday (grace period)
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    
    while (true) {
      const checkDateStr = toUTCDateStr(checkDate);
      
      if (!normalizedDatesSet.has(checkDateStr)) {
        break;
      }
      
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }
  }

  return streak;
}


export default function PerformancePage() {
  const user = useUser() as { id?: string } | null;

  const [sessions, setSessions] = useState<PerformanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [totalSessions, setTotalSessions] = useState(0);
  const [averageAccuracy, setAverageAccuracy] = useState(0);
  const [averageConsistency, setAverageConsistency] = useState(0);
  const [streak, setStreak] = useState(0);
  const [poses, setPoses] = useState<Pose[]>([])


  useEffect(() => {
    setError(null); //Reset to default values every now and then to ensure proper page render
    setLoading(true);

    if (!user?.id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("post_performance")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setSessions([]);
          setTotalSessions(0);
          setAverageAccuracy(0);
          setAverageConsistency(0)
          setStreak(0);
          setLoading(false);
          return;
        }

        setSessions(data);

        // Compute total sessions
        setTotalSessions(data.length);

        // Compute average accuracy
        const sumAccuracy = data.reduce((sum, session) => sum + session.accuracy_score, 0);
        const avgAccuracy = sumAccuracy / 100 / data.length; //Divide by 100 to normalize to 100% scale
        setAverageAccuracy(parseFloat(avgAccuracy.toFixed(0)));

        // Compute average consistency
        const sumConsistency = data.reduce((sum, session) => sum + session.consistency_score, 0);
        const avgConsistency = sumConsistency / 100 / data.length; //Divide by 100 to normalize to 100% scale
        setAverageConsistency(parseFloat(avgConsistency.toFixed(0)));

        // Compute streak
        // Extract unique dates (YYYY-MM-DD) with sessions
        const uniqueDatesSet = new Set(
          data.map((session) => getDateString(new Date(session.date)))
        );
        const uniqueDates = Array.from(uniqueDatesSet);
        const calculatedStreak = calculateStreak(uniqueDates);
        setStreak(calculatedStreak);

        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch data");
        }
        setLoading(false);      
      }
    };

    const fetchPoses = async () => {
      try {
        const { data, error } = await supabase
          .from('poseLibrary')
          .select('id, name')  // adjust field names if different
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching poses:', error)
          return
        }

        if (data) {
          setPoses(data)
        }
      } catch (err) {
        console.error('Unexpected error fetching poses:', err)
      }
    }

    const fetchData = async () => {
      await Promise.all([fetchSessions(), fetchPoses()])
    }

    fetchData()
  }, [user?.id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading Performance Data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-red-500">
        <p className="text-lg font-semibold">{error}</p>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <PageTopBar
        title="Performance Analytics"
        description="Gain insight into your skill, consistency, and overall yoga experience with AI-powered analytics!"
        backHref="/practice"
      />
      
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Sessions</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">{totalSessions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-primary text-xl">📊</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Accuracy</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">{averageAccuracy}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center">
                <span className="text-accent text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Consistency</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">{averageConsistency}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center">
                <span className="text-accent text-xl">🎯</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold bg-gradient-to-t from-yellow-300 to-red-400 bg-clip-text text-transparent">{streak} {streak === 1 ? "day" : "days"}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-premium/10 to-yellow-200/10 flex items-center justify-center">
                <span className="text-premium text-xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Row */}
          <div className="bg-card.glass rounded-2xl border border-border/50 shadow-card">
            <ChartBarWeeklyProgress sessions={sessions}/>
          </div>
          
          <div className="bg-card.glass rounded-2xl border border-border/50 shadow-card">
            <ChartPiePoseDistribution sessions={sessions} poses={poses}/>
          </div>
          
          {/* Bottom Row */}
          <div className="bg-card.glass rounded-2xl border border-border/50 shadow-card">
            <ChartLineConsistency sessions={sessions}/>
          </div>
          
          <div className="bg-card.glass rounded-2xl border border-border/50 shadow-card">
            <ChartLineAccuracy sessions={sessions}/>
          </div>
        </div>
      </section>
    </main>
  );
} 
'use client'
import { TrendingUp, Trophy, Users } from "lucide-react";
import { useUser } from "../user-provider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const Stats = () => {
    const user = useUser() as { id?: string } | null;
    const [activeMembers, setActiveMembers] = useState<number|null>(null);
    const [sessionsToday, setSessionsToday] = useState<number|null>(null);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        // Fetch active members (count of profiles)
        supabase.from("profiles").select("id", { count: "exact", head: true })
            .then(({ count }) => {
                setActiveMembers(count ?? 0);
                setLoadingMembers(false);
            });
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const supabase = createClient();
        // Get today's date in YYYY-MM-DD format (UTC)
        const today = new Date();
        const yyyy = today.getUTCFullYear();
        const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(today.getUTCDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        // Fetch post_performance for this user, filter by today
        supabase
            .from("post_performance")
            .select("date", { count: "exact" })
            .eq("user_id", user.id)
            .gte("date", todayStr + "T00:00:00.000Z")
            .lte("date", todayStr + "T23:59:59.999Z")
            .then(({ count }) => {
                setSessionsToday(count ?? 0);
                setLoadingSessions(false);
            });
    }, [user]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
                  {loadingMembers ? '...' : activeMembers}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Challenges</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">12</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions Today</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-premium to-yellow-200 bg-clip-text text-transparent">
                  {loadingSessions ? '...' : sessionsToday}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-premium/10 to-yellow-200/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-premium" />
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">#47</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-500/10 to-gray-400/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
    );
}
 
export default Stats;
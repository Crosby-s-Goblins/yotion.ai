import PageTopBar from "@/components/page-top-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, TrendingUp, MessageCircle, Heart, Share2 } from "lucide-react";

import PostWriter from "@/components/communityPage/postWriter"
import AllPosts from "@/components/communityPage/allPosts"
import Stats from "@/components/communityPage/stats";
import Challenges from "@/components/communityPage/challenges";
import Leaderboard from "@/components/communityPage/leaderboard";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <PageTopBar 
        title="Community Hub"
        description="Connect with fellow yogis, share achievements, and participate in challenges!"
        backHref="/practice"
      />
      
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Community Stats */}
        <Stats/>

        {/* Write a post */}
        <PostWriter/>

        {/* Community Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <AllPosts/>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Challenges */}
            {/* <Challenges/> */}

            {/* Leaderboard */}
            <Leaderboard/>
          </div>
        </div>
      </section>
    </main>
  );
} 
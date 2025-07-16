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
            <Challenges/>

            {/* Leaderboard */}
            <Card className="bg-card.glass border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
                  This Week's Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Emma Wilson", score: "2,847", rank: 1 },
                  { name: "David Kim", score: "2,634", rank: 2 },
                  { name: "Lisa Park", score: "2,521", rank: 3 },
                  { name: "You", score: "2,198", rank: 4 },
                  { name: "Alex Rivera", score: "2,045", rank: 5 }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600 text-yellow-900' :
                        index === 1 ? 'bg-gradient-to-tr from-gray-300 to-gray-500 text-gray-700' :
                        index === 2 ? 'bg-gradient-to-tr from-amber-600 to-amber-800 text-amber-100' :
                        'bg-gradient-to-tr from-gray-100 to-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium ${user.name === "You" ? 'text-primary' : ''}`}>
                        {user.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
} 
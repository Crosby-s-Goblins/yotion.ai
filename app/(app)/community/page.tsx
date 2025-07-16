'use client'
import { useState } from "react";
import PageTopBar from "@/components/page-top-bar";

import PostWriter from "@/components/communityPage/postWriter"
import AllPosts from "@/components/communityPage/allPosts"
import Stats from "@/components/communityPage/stats";
// import Challenges from "@/components/communityPage/challenges";
import Leaderboard from "@/components/communityPage/leaderboard";

export default function CommunityPage() {
  const [postsReloadKey, setPostsReloadKey] = useState(0);
  const handlePostSubmit = () => setPostsReloadKey(k => k + 1);
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
        <PostWriter onPostSubmit={handlePostSubmit}/>

        {/* Community Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <AllPosts reloadKey={postsReloadKey}/>

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
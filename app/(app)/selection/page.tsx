'use client';

import React, { useState, useEffect } from "react";
import { AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import { PoseItem } from "@/components/selectorCardComponents/poseItem";
import { ExpandedPoseCard } from "@/components/selectorCardComponents/expandedPoseCard";
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import { difficultyColors } from "@/components/selectorCardComponents/poseItem";
import { motion } from "framer-motion";
import { useUser } from '@/components/user-provider';
import PageTopBar from "@/components/page-top-bar";
import TimerSelect from "@/components/TimerSelect";
import { useTimer } from "@/context/TimerContext";

export default function SelectionComponents() {
  const user = useUser();
  const [poses, setPoses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [expandedPose, setExpandedPose] = useState<number | null>(null);
  const [paidStatus, setPaidStatus] = useState<boolean | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const { setTimerSeconds } = useTimer();


  useEffect(() => {
  const fetchFilteredPoses = async () => {
    let query = supabase.from("poseLibrary").select("*");

    if (difficultyFilter) {
      query = query.eq("difficulty", difficultyFilter);
    }

    const { data, error } = await query;

    error ?
      (console.error("Error fetching poses:", error)) : (setPoses(data));
    
  };

  fetchFilteredPoses();
}, [difficultyFilter]);

  useEffect(() => {
    setTimerSeconds(60); // Reset to 60 on page load
  }, []);

  useEffect(() => {
    if (user) {
      const supabase = createClient();
      supabase
        .from('profiles')
        .select('paidUser')
        .eq('id', user.id)
        .single()
        .then(({ data: profileData }) => {
          if (profileData) setPaidStatus(profileData.paidUser);
        });
    } else {
      setPaidStatus(null);
    }
  }, [user]);

  useEffect(() => {
          const alreadyReloaded = sessionStorage.getItem('reloaded');
  
          if (!alreadyReloaded) {
          sessionStorage.setItem('reloaded', 'true');
          window.location.reload();
          } //Force reload
  
          
          return () => {
          sessionStorage.removeItem('reloaded');
          };
      }, []);

  const supabase = createClient();

  const handlePoseClick = (index: number) => {
    if (expandedPose === index) {
      setExpandedPose(null);
    } else {
      setExpandedPose(index);
    }
  };

  const handleClose = () => {
    setExpandedPose(null);
  };

  //Search filter functionality
  const searchedItems = poses.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if(paidStatus === null){
    return <Loading />;
  }
  if(paidStatus){
    return (
    <main className="h-screen flex flex-col items-center">
      <PageTopBar
        title="Welcome to Your Practice"
        description="Start your yoga journey with AI-powered guidance"
        backHref="/practice"
      />
      <section className="flex flex-col w-full flex-1 items-center">
        <div className="w-full max-w-2xl px-4 mb-6">
          <Input 
          className="w-full rounded-3xl border-2 py-6 px-8" 
          placeholder="Search"
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}/>
        </div>
      {/* Horizontal Layout for Filter + Scroll Area */}
      <div className="w-full max-w-6xl px-4 flex flex-row gap-6">
        {/* Filter Panel */}
        <div className="min-w-[200px] p-4 rounded-3xl border-2 h-fit flex flex-col gap-6">
          {/* Difficulty Filter */}
           <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Difficulty</h3>
              {difficultyFilter && (
                <button
                  onClick={() => setDifficultyFilter(null)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <Select onValueChange={(value) => setDifficultyFilter(value)} value={difficultyFilter ?? ""}>
              <SelectTrigger className="w-full rounded-xl border">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder Filter 1 */}
          <div>
            <h3 className="font-semibold mb-2">Filter Option 1</h3>
            <div className="rounded-xl border p-2 text-sm text-gray-500">Coming Soon</div>
          </div>

          {/* Placeholder Filter 2 */}
          <div>
            <h3 className="font-semibold mb-2">Filter Option 2</h3>
            <div className="rounded-xl border p-2 text-sm text-gray-500">Coming Soon</div>
          </div>

          {/* Timer Filter */}
           <TimerSelect />
        </div>

        {/* Scroll Area */}
        <div className="w-full">
          <ScrollArea className="rounded-3xl border-2 h-full w-full flex-1 [&>[data-radix-scroll-area-viewport]]:max-h-[calc(100vh-240px)]">
            <div className="pr-4 -mr-4">
              {searchedItems.length === 0 ? (
                <p className="text-gray-500 items-center justify-center flex mt-10">No items found.</p>
              ) : (
                searchedItems.map((pose, index) => (
                  <div key={index} className="relative">
                    <PoseItem
                      {...pose}
                      onClick={() => handlePoseClick(index)}
                      isExpanded={expandedPose === index}
                    />
                    <AnimatePresence>
                      {expandedPose === index && (
                        <ExpandedPoseCard pose={pose} onClose={handleClose} />
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </section>
  </main>  
  );
}
else{
  const maxFree = 3; //Set maximum number of free poses
  const lockedItems = searchedItems.slice(maxFree);
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <PageTopBar
        title="Welcome to Your Practice"
        description="Start your yoga journey with AI-powered guidance"
        backHref="/practice"
      />

      <div className="w-full max-w-2xl px-4 mb-6">
        <Input className="flex flex-row rounded-3xl border-2 py-6 px-8" placeholder="Search"
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>


      {/* TODO:
        Determine which 3 exercises to allow & how to show those
        How to cover up the other exercises and if someone tries to click those, "Link" them to payment
        Make sure functionality continues to work
      */}
      {/* Need to filter down to free poses - Attribute in Supabase */}
      <div className="w-full max-w-2xl px-4">
        <div className="bg-white rounded-3xl border-2 h-full overflow-hidden">
          <ScrollArea className="h-[700px] rounded-3xl">
            <div className="pr-4 -mr-4">
              {searchedItems.length === 0 ? (
            <p className="text-gray-500 items-center justify-center flex mt-10">No items found.</p>
              ) : (
              searchedItems.filter(pose => pose.isFree).map((pose, index) => (
                <div key={index} className="relative">
                  <PoseItem 
                    {...pose} 
                    onClick={() => handlePoseClick(index)}
                    isExpanded={expandedPose === index}
                  />
                  <AnimatePresence>
                    {expandedPose === index && (
                      <ExpandedPoseCard 
                        pose={pose} 
                        onClose={handleClose}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )))}
                <div className="relative mt-4">
                {/* Fake locked cards */}
                  <div className="space-y-2 pointer-events-none select-none">
                    {lockedItems.map((pose, i) => (
                      <motion.div
                        key={i}
                        className="flex flex-col bg-white/70 rounded-2xl shadow cursor-not-allowed"
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-row py-4 px-8 items-center justify-between opacity-40">
                          <p className="font-medium">{pose.name}</p>
                          <div
                            className={`flex flex-row ${difficultyColors[pose.difficulty as keyof typeof difficultyColors]} px-6 py-2 rounded-full w-28 justify-center items-center`}
                          >
                            <p className="text-white text-sm font-medium">{pose.difficulty}</p>
                          </div>
                        </div>
                        <hr className="border-gray-200 -mx-8 opacity-40" />
                      </motion.div>
                    ))}
                </div>

                {/* Frosted glass overlay with lock */}
                <div className="absolute inset-0 rounded-3xl z-10 flex pt-10 justify-center bg-white/40 backdrop-blur-md text-black font-semibold text-center -mt-4">
                  <div>
                    🔒 <br />
                    These poses are premium. <br />
                    <button
                      onClick={console.log("Implement Payment later")} //TODO: Implement proper logic later
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Unlock Premium
                    </button>
                  </div>
                </div> 
              </div>           
            </div>
          </ScrollArea>
        </div>
      </div>
    </main> );
  }
}
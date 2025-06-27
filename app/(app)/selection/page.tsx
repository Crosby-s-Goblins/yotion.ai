'use client';

import React, { useState, useEffect } from "react";
import { AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ArrowLeftFromLine } from 'lucide-react';
import Link from "next/link";
import { PoseItem } from "@/components/selectorCardComponents/poseItem";
import { ExpandedPoseCard } from "@/components/selectorCardComponents/expandedPoseCard";
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import { difficultyColors } from "@/components/selectorCardComponents/poseItem";
import { motion } from "framer-motion";

export default function SelectionComponents() {
  const [poses, setPoses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [expandedPose, setExpandedPose] = useState<number | null>(null);
  const [paidStatus, setPaidStatus] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
  async function fetchPoses() {
    const { data, error } = await supabase.from("poseLibrary").select('*');
    error ? console.error('Error fetching poses:', error) : setPoses(data);
  } //Change 'practTable' to actual pose table name
    /*
    Run in SQL editor on Supabase (Allows read access necessary for pull):
    CREATE POLICY "Allow public read"
    ON "table_name_here"
    FOR SELECT
    USING (true);
    */

  fetchPoses(); 
  }, []);

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
      const getUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
  
          if (user) {
            // get profile info
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select("paidUser")
              .eq('id', user.id)
              .single();
            if (profileData) setPaidStatus(profileData.paidUser);
          } else {
            setPaidStatus(null);
          }
        } catch (error) {
          console.error('Error getting user:', error);
        }
      };
      getUser();
  

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
  const filteredItems = poses.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if(paidStatus === null){
    return <Loading />;
  }
  if(paidStatus){
    return (
    <main className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col text-center">
        <div className="flex w-screen items-center">
          <div className="flex basis-1/3 justify-start pl-16">  
            <Link href="/practice">
              <ArrowLeftFromLine className=""/>
            </Link>
          </div>
          <div className="flex basis-1/3 justify-center"> 
            <h1 className="text-2xl font-bold">Welcome to Your Practice</h1>
          </div>
          <div className="flex basis-1/3">
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Start your yoga journey with AI-powered guidance
        </p>
      </div>

      <div className="w-full max-w-2xl px-4 mb-6 mt-12">
        <Input className="flex flex-row rounded-3xl border-2 py-6 px-8" placeholder="Search"
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>

      <div className="w-full max-w-2xl px-4">
        <div className="bg-white rounded-3xl border-2 h-full overflow-hidden">
          <ScrollArea className="h-[700px] rounded-3xl">
            <div className="pr-4 -mr-4">
              {filteredItems.length === 0 ? (
            <p className="text-gray-500 items-center justify-center flex mt-10">No items found.</p>
              ) : (
              filteredItems.map((pose, index) => (
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
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>    
  );
}
else{
  const maxFree = 3; //Set maximum number of free poses
  const lockedItems = filteredItems.slice(maxFree);
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col text-center">
        <div className="flex w-screen items-center">
          <div className="flex basis-1/3 justify-start pl-16">  
            <Link href="/practice">
              <ArrowLeftFromLine className=""/>
            </Link>
          </div>
          <div className="flex basis-1/3 justify-center"> 
            <h1 className="text-2xl font-bold">Welcome to Your Practice</h1>
          </div>
          <div className="flex basis-1/3">
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Start your yoga journey with AI-powered guidance
        </p>
      </div>

      <div className="w-full max-w-2xl px-4 mb-6 mt-12">
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
              {filteredItems.length === 0 ? (
            <p className="text-gray-500 items-center justify-center flex mt-10">No items found.</p>
              ) : (
              filteredItems.filter(pose => pose.isFree).map((pose, index) => (
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
                            className={`flex flex-row ${difficultyColors[pose.difficulty]} px-6 py-2 rounded-full w-28 justify-center items-center`}
                          >
                            <p className="text-white text-sm font-medium">{pose.difficulty}</p>
                          </div>
                        </div>
                        <hr className="border-gray-200 -mx-8 opacity-40" />
                      </motion.div>
                    ))}
                </div>

                {/* Frosted glass overlay with lock */}
                <div className="absolute inset-0 rounded-3xl z-10 flex items-center justify-center bg-white/40 backdrop-blur-md text-black font-semibold text-center -mt-4">
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
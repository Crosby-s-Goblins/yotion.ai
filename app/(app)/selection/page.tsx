'use client';

import { supabase } from "@/lib/supabase/supabaseClient";
import React, { useState, useEffect } from "react";
import { AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ArrowLeftFromLine } from 'lucide-react';
import Link from "next/link";
import { PoseItem } from "@/components/selectorCardComponents/poseItem";
import { ExpandedPoseCard } from "@/components/selectorCardComponents/expandedPoseCard";

export default function SelectionComponents() {
  const [poses, setPoses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [expandedPose, setExpandedPose] = useState<number | null>(null);


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
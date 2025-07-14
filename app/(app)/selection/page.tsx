'use client';

import React, { useState, useEffect, useDeferredValue, useMemo } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import { difficultyColors } from "@/components/selectorCardComponents/poseItem";
import { useUser } from '@/components/user-provider';
import PageTopBar from "@/components/page-top-bar";
import { useTimer } from "@/context/TimerContext";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Filter, Search, Target } from 'lucide-react';
import { Pose } from "@/components/selectorCardComponents/types";

export default function SelectionComponents() {
  const [poses, setPoses] = useState<Pose[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();
  const { setTimerSeconds, timerSeconds } = useTimer();
  const [paidStatus, setPaidStatus] = useState<boolean | null>(null);
  const [modalTimer, setModalTimer] = useState<number>(timerSeconds);
  const [isFilterReady, setIsFilterReady] = useState(false);
  const [hasPageEntered, setHasPageEntered] = useState(false);

  // Simulate page transition to account for page change animations
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasPageEntered(true);
    }, 400); // make sure time matches the naimation duration (ms)
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
  const fetchEverything = async () => {
    try {
      const supabase = createClient();

      // Check paid status first (Resolving unintentional race codition)
      let finalPaidStatus = false;

      if (user) {
        const { data: allProfileData, error: allError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const parseBool = (v: any) => v === true || v === 'true';

        finalPaidStatus =
          parseBool(allProfileData?.paidUser) ||
          parseBool(allProfileData?.paid_status) ||
          parseBool(allProfileData?.isPaid) ||
          parseBool(allProfileData?.premium);

        setPaidStatus(finalPaidStatus);
      }

      // Fetch poses using correct paid status
      let poseCall = supabase
        .from('poseLibrary')
        .select('*');

      if (!finalPaidStatus) {
        poseCall = poseCall.order('isFree', { ascending: false });
      }

      poseCall = poseCall.order('name');

      const { data, error } = await poseCall;

      if (error) {
        console.error('Error fetching poses:', error);
      } else {
        setPoses(data || []);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    fetchEverything();
  }
}, [user]);


  const handlePoseSelect = (pose: Pose) => {
    setSelectedPose(pose);
    setModalTimer(timerSeconds); // default to current timer
  };

  const handleCloseExpanded = () => {
    setSelectedPose(null);
  };

  const handleStartSession = () => {
    if (!selectedPose) return;
    setTimerSeconds(modalTimer);
    window.location.href = `/skele?poseId=${selectedPose.id}`;
  };


  useEffect(() => {
    const delay = setTimeout(() => {
      setIsFilterReady(true);
    }, 50); // tweak delay as needed for perceived smoothness (ms)

    return () => {
      clearTimeout(delay);
      setIsFilterReady(false); // reset if search changes
    };
  }, [deferredSearch]);


  //Search filter functionality
  const searchedItems = useMemo(() => {
  return poses.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(deferredSearch.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      item.difficulty.toLowerCase() === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });
}, [poses, deferredSearch, selectedDifficulty]);

  if(paidStatus === null){
    return <Loading />;
  }

  // --- Pose Card ---
  const PoseCard = ({ pose, locked }: { pose: Pose, locked?: boolean }) => (
    <motion.div
      key={pose.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div
        className={`bg-card.glass rounded-2xl border border-border/50 shadow-card hover:shadow-glass transition-all duration-200 cursor-pointer ${locked ? 'opacity-60 pointer-events-none' : ''}`}
        onClick={() => !locked && handlePoseSelect(pose)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{pose.name}</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${difficultyColors[pose.difficulty]}`}>
              {pose.difficulty}
            </div>
          </div>
          {pose.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pose.description}
            </p>
          )}
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
          <div className="text-center text-white">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Premium</p>
            <p className="text-xs opacity-80">Upgrade to unlock</p>
          </div>
        </div>
      )}
    </motion.div>
  );
  if (paidStatus === null || isLoading) return <Loading />; //When all conditions are not properly loaded, have a wait
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <PageTopBar
        title="Choose Your Practice"
        description={paidStatus ? "Select from our curated collection of AI-powered yoga poses" : "Start your yoga journey with AI-powered guidance"}
        backHref="/practice"
      />
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Search and Filter Section */}
        <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                className="w-full pl-12 pr-4 h-12 rounded-full border-2 bg-background/50 backdrop-blur-sm"
                placeholder="Search poses..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-12 px-6 rounded-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 bg-white border border-border/50 shadow-glass">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Difficulty Level
                    </label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Poses Grid */}
        <motion.div
          className="min-h-[400px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFilterReady ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hasPageEntered ? (
              <AnimatePresence mode="popLayout" initial={false}>
                {isFilterReady ? (
                  searchedItems.length > 0 ? (
                    searchedItems.map((pose) => (
                      <motion.div
                        key={pose.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PoseCard pose={pose} locked={!paidStatus && !pose.isFree} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      key="no-poses"
                      className="col-span-full text-center text-muted-foreground italic"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      No poses found for "<span className="font-medium">{search}</span>"
                    </motion.div>
                  )
                ) : null}
              </AnimatePresence>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchedItems.map((pose) => (
                  <div key={pose.id}>
                    <PoseCard pose={pose} locked={!paidStatus && !pose.isFree} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Expanded Pose Modal */}
      <AnimatePresence>
        {selectedPose && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseExpanded}
          >
            <motion.div
              className="relative bg-white border border-border/50 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-glass flex flex-col"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseExpanded} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                ×
              </button>
              <div className="flex-grow">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent mb-2">
                    {selectedPose.name}
                  </h2>
                  <p className="text-muted-foreground mb-2">{selectedPose.description || "No description available."}</p>
                  {selectedPose.images && (
                    <img
                      src={selectedPose.images}
                      alt={`${selectedPose.name} reference`}
                      className="w-full h-48 object-contain rounded-xl border-2 border-white/20 mx-auto mb-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                {/* Timer Selection */}
                <div className="mb-4">
                  <label className="font-semibold mb-2 block">Timer Length</label>
                  <select
                    value={modalTimer}
                    onChange={(e) => setModalTimer(Number(e.target.value))}
                    className="w-full rounded-xl border py-2 px-3 cursor-pointer"
                  >
                    {[30, 60, 90, 120, 150].map((sec) => (
                      <option key={sec} value={sec}>
                        {sec} seconds
                      </option>
                    ))}
                  </select>
                </div>
                {/* Start Session Button */}
                <Button className="w-full h-12 rounded-2xl text-lg mt-2" onClick={handleStartSession}>
                  Start Session
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
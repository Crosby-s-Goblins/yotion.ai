'use client';

import React, { useState, useEffect, useDeferredValue, useMemo } from "react";
import Image from "next/image";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Session } from '@/components/selectorCardComponents/types';
import { SessionCard } from '@/components/selectorCardComponents/sessionCard';
import { useProgramSession } from '@/context/ProgramSessionContext';

export default function SelectionComponents() {
  const [poses, setPoses] = useState<Pose[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser() as { id?: string } | null;
  const { timerSeconds, setTimerSeconds, resetTimerToDefault, isLoaded } = useTimer();
  const [paidStatus, setPaidStatus] = useState<boolean | null>(null);
  const [modalTimer, setModalTimer] = useState<number>(timerSeconds);
  const [isFilterReady, setIsFilterReady] = useState(false);
  const [hasPageEntered, setHasPageEntered] = useState(false);
  const [reflectPose, setReflectPose] = useState(false);
  // Add state for sessions and tab
  const [tab, setTab] = useState('poses');
  const [programs, setPrograms] = useState<Session[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [programSearch, setProgramSearch] = useState("");
  const [selectedProgramDifficulty, setSelectedProgramDifficulty] = useState("all");
  const deferredProgramSearch = useDeferredValue(programSearch);
  const [isProgramFilterReady, setIsProgramFilterReady] = useState(false);
  const { resetSession } = useProgramSession();

  useEffect(() => {
    resetTimerToDefault();
  }, [resetTimerToDefault]);

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
        const { data: allProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const parseBool = (v: unknown) => v === true || v === 'true';

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

  // Fetch programs for program tab (from sessionLibrary)
  useEffect(() => {
    if (tab !== 'programs' || !user?.id) return;
    setProgramsLoading(true);
    setProgramsError(null);
    const supabase = createClient();
    let programCall = supabase
      .from('sessionLibrary')
      .select('*');
    if (!paidStatus) {
      programCall = programCall.order('isFree', { ascending: false });
    }
    programCall = programCall.order('name');
    programCall.then(({ data, error }) => {
      if (error) setProgramsError(error.message);
      // Transform data to match Session type
      const transformed = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        posesIn: Array.isArray(item.posesIn)
          ? item.posesIn
          : typeof item.posesIn === 'string'
            ? JSON.parse(item.posesIn)
            : [],
        poseTiming: Array.isArray(item.poseTiming)
          ? item.poseTiming.map(Number)
          : typeof item.poseTiming === 'string'
            ? JSON.parse(item.poseTiming).map(Number)
            : [],
        difficulty: typeof item.difficulty === 'string'
          ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1).toLowerCase()
          : 'Easy',
        searchRes: typeof item.searchRes === 'string' ? item.searchRes : '',
      }));
      setPrograms(transformed);
      setProgramsLoading(false);
    });
  }, [tab, user?.id, paidStatus]);

  // Program search/filter effect for perceived smoothness
  useEffect(() => {
    const delay = setTimeout(() => {
      setIsProgramFilterReady(true);
    }, 10); // Decreased delay for smoother animation
    return () => {
      clearTimeout(delay);
      setIsProgramFilterReady(false);
    };
  }, [deferredProgramSearch]);

  // Program search/filter logic
  const searchedPrograms = useMemo(() => {
    return programs.filter((item) => {
      const searchTerm = deferredProgramSearch.toLowerCase();
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm) ||
        item.searchRes?.toLowerCase().includes(searchTerm);
      const matchesDifficulty =
        selectedProgramDifficulty === 'all' ||
        item.difficulty?.toLowerCase() === selectedProgramDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [programs, deferredProgramSearch, selectedProgramDifficulty]);


  const handlePoseSelect = (pose: Pose) => {
    if (!isLoaded) return; // Prevent selection until timer is loaded
    setSelectedPose(pose);
    setModalTimer(timerSeconds); // Always use the current timerSeconds (from context, which is preference or 60)
  };

  // Handler for the Start Session button in the pose modal
  const handleStartSinglePoseSession = () => {
    if (!selectedPose) return;
    resetSession(); // Ensure program context is cleared for single-pose mode
    localStorage.setItem('timerSeconds', String(modalTimer));
    const confirmed = localStorage.getItem('timerSeconds');
    console.log('Confirmed timerSeconds in localStorage:', confirmed);
    if (String(modalTimer) !== confirmed) {
      alert('Timer value not written to localStorage! Try again.');
      return;
    }
    window.location.href = `/skele?poseId=${selectedPose.id}${reflectPose ? '&reverse=true' : ''}`;
  };

  const handleCloseExpanded = () => {
    setSelectedPose(null);
  };

  const handleStartSession = () => {
    if (!selectedPose) return;
    setTimerSeconds(modalTimer); // Always set timerSeconds to modalTimer, even if unchanged
    window.location.href = `/skele?poseId=${selectedPose.id}${reflectPose ? '&reverse=true' : ''}`;
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

  if (!isLoaded || paidStatus === null) {
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
            <h3 className="font-semibold text-lg leading-snug h-[3rem] break-words line-clamp-2">{pose.name}</h3>
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <PageTopBar
        title="Choose Your Practice"
        description={paidStatus ? "Select from our curated collection of AI-powered yoga poses or your past sessions" : "Start your yoga journey with AI-powered guidance"}
        backHref="/practice"
      />
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Tabs Switcher */}
        <Tabs value={tab} onValueChange={setTab} className="mb-8">
          <TabsList className="border-b border-border">
            <TabsTrigger value="poses" className="cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-muted data-[state=active]:font-semibold transition-colors">
              Poses
            </TabsTrigger>
            <TabsTrigger value="programs" className="cursor-pointer data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-muted data-[state=active]:font-semibold transition-colors">
              Programs
            </TabsTrigger>
          </TabsList>
          {/* Pose Selection Tab */}
          <TabsContent value="poses">
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
              <div className=""> {/* "max-h-[calc(x*10rem)] overflow-y-auto" --To confine list of poses to x rows */}
                {hasPageEntered ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            No poses found for &quot;<span className="font-medium">{search}</span>&quot;
                          </motion.div>
                        )
                      ) : (
                        <motion.div
                          key="no-poses"
                          className="col-span-full text-center text-muted-foreground italic"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          No poses found for &quot;<span className="font-medium">{search}</span>&quot;
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
          </TabsContent>
          {/* Program Selection Tab */}
          <TabsContent value="programs">
            {/* Search and Filter Section for Programs */}
            <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    className="w-full pl-12 pr-4 h-12 rounded-full border-2 bg-background/50 backdrop-blur-sm"
                    placeholder="Search programs..."
                    type="text"
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
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
                        <Select value={selectedProgramDifficulty} onValueChange={setSelectedProgramDifficulty}>
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
            {paidStatus ? (
              programsLoading ? (
                <Loading />
              ) : programsError ? (
                <div className="text-red-500 text-center py-8">{programsError}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isProgramFilterReady ? (
                      searchedPrograms.length > 0 ? (
                        searchedPrograms.map((program) => (
                          <SessionCard key={program.id} session={program} locked={!paidStatus} />
                        ))
                      ) : (
                        <motion.div
                          key="no-programs"
                          className="col-span-full text-center text-muted-foreground italic"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          No programs found for &quot;<span className="font-medium">{programSearch}</span>&quot;
                        </motion.div>
                      )
                    ) : (
                      <motion.div
                        key="no-programs"
                        className="col-span-full text-center text-muted-foreground italic"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        No programs found for &quot;<span className="font-medium">{programSearch}</span>&quot;
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            ) : (
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-60 pointer-events-none">
                  {/* Show fake/empty cards or a message */}
                  <motion.div
                    key="paywall"
                    className="col-span-full text-center text-muted-foreground italic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    Programs are a premium feature.<br />Upgrade to unlock program history!
                  </motion.div>
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Premium</p>
                    <p className="text-xs opacity-80">Upgrade to unlock program selection</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        {/* Expanded Pose Modal */}
        <AnimatePresence>
          {selectedPose && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto"
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
                    {/* Reverse Pose Toggle */}
                    {selectedPose.images && (
                      <Image
                        src={selectedPose.images}
                        alt={`${selectedPose.name} reference`}
                        width={400}
                        height={192}
                        className={`w-full h-48 object-contain rounded-xl border-2 border-white/20 mx-auto mb-4 ${reflectPose ? 'scale-x-[-1]' : ''}`}
                        style={reflectPose ? { transform: 'scaleX(-1)' } : {}}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        unoptimized
                      />
                    )}
                  </div>
                  {/* Timer Selection */}
                  <div className="mb-4">
                    <label className="font-semibold mb-2 block">Timer Length</label>
                    <select
                      value={modalTimer}
                      onChange={(e) => {
                        setModalTimer(Number(e.target.value));
                        setTimerSeconds(Number(e.target.value));
                        localStorage.setItem('timerSeconds', String(Number(e.target.value)));
                        console.log('Timer modal changed, set to:', Number(e.target.value));
                      }}
                      className="w-full rounded-xl border py-2 px-3 cursor-pointer"
                    >
                      {[30, 60, 90, 120, 150].map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} seconds
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Reverse Pose Toggle (only for asymmetric poses) */}
                  {selectedPose.isAsymmetric && (
                    <div className="w-full flex flex-col items-center mb-4">
                      <div className="bg-card.glass border border-border/50 rounded-xl px-6 py-4 flex flex-row items-center justify-center gap-4 shadow-card w-full max-w-md">
                        <span className="font-semibold text-base text-foreground flex items-center">
                          Reverse Pose
                        </span>
                        <Switch
                          id="reverse-pose-toggle"
                          checked={reflectPose}
                          onCheckedChange={setReflectPose}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  )}
                  {/* Start Session Button */}
                  <Button className="w-full h-12 rounded-2xl text-lg mt-2" onClick={handleStartSinglePoseSession}>
                    Start Session
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
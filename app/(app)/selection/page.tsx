'use client';

import React, { useState, useEffect, useDeferredValue, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import { difficultyColors } from "@/components/selectorCardComponents/poseItem";
import { useUser } from '@/components/user-provider';
import PageTopBar from "@/components/page-top-bar";
import { useTimer } from "@/context/TimerContext";
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Target, X } from 'lucide-react';
import { Pose } from "@/components/selectorCardComponents/types";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Session } from '@/components/selectorCardComponents/types';
import { SessionCard } from '@/components/selectorCardComponents/programCard';
import { useProgramSession } from '@/context/ProgramSessionContext';
import AddProgramModal from '@/components/selectorCardComponents/addProgramModal';
import { Badge } from "@/components/ui/badge";

const muscleGroupMap: Record<string, string[]> = {
  core: ["Core", "Obliques", "Obliques_Stretch", "Rectus_Abdominis", "Intercostals"],
  back: ["Spinal_Erectors", "Spinal_Extensors", "Trapezius", "Lower_Back", "Psosas_Stretch", "Quadratus_Lumborum", "Upper_Back", "Rhomboids", "Latissimus_Dorsi", "Lats", "Erector_Spinae"],
  shoulders: ["Shoulders", "Deltoids", "Shoulder_Stabilizers", "Shoulders_Stretch"],
  chest: ["Chest", "Pectorals"],
  arms: ["Biceps", "Triceps", "Forearms"],
  legs: ["Quadriceps", "Quadriceps_Stretch", "Hamstrings", "Hamstrings_Stretch", "Calves", "Calves_Stretch", "Adductors", "Adductors_Stretch"],
  glutes: ["Glutes", "Gluteus_Maximus", "Gluteus_Medius"],
  hips: ["Hip_Flexors"],
  neck: ["Neck_Flexors", "Sternocleidomastoid"],
  feet_ankles: ["Ankle_Flexors", "Ankle_Stabilizers", "Feet", "Ankles"],
};

export default function SelectionComponents() {
  const [poses, setPoses] = useState<Pose[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);
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
  const [programsFetched, setProgramsFetched] = useState(false);
  const [programSourceFilter, setProgramSourceFilter] = useState<'all' | 'premade' | 'user'>('all');
  const [programSearch, setProgramSearch] = useState("");
  const [selectedProgramDifficulty, setSelectedProgramDifficulty] = useState("all");
  const deferredProgramSearch = useDeferredValue(programSearch);
  const [isProgramFilterReady, setIsProgramFilterReady] = useState(false);
  const { resetSession } = useProgramSession();
  const [addProgramOpen, setAddProgramOpen] = useState(false);
  const [editProgramOpen, setEditProgramOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Session | null>(null);

  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [selectedSpecificMuscle, setSelectedSpecificMuscle] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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

        const { data } = await poseCall;

        if (data) {
          setPoses(data || []);
        }
      } catch (error) {
        console.error('Error during fetch:', error);
      } finally {
      }
    };

    if (user) {
      fetchEverything();
    }
  }, [user]);

  // Fetch programs from both sessionLibrary and userSessionLibrary ONCE per page load
  useEffect(() => {
    if (!user?.id || programsFetched) return;
    setProgramsLoading(true);
    setProgramsError(null);
    const supabase = createClient();
    // Fetch both in parallel
    Promise.all([
      supabase.from('sessionLibrary').select('*').order('name'),
      supabase.from('userSessionLibrary').select('*').eq('user_id', user.id).order('name'),
    ]).then(([globalRes, userRes]) => {
      let allPrograms: unknown[] = [];
      if (globalRes.data) {
        allPrograms = allPrograms.concat(
          (globalRes.data || []).map((item: unknown) => ({
            ...(item as Session),
            isUser: false,
            id: `global-${(item as Session).id}`,
          }))
        );
      }
      if (userRes.data) {
        allPrograms = allPrograms.concat(
          (userRes.data || []).map((item: unknown) => ({
            ...(item as Session),
            isUser: true,
            id: `user-${(item as Session).id}`,
          }))
        );
      }
      setPrograms(allPrograms as Session[]);
      setProgramsLoading(false);
      setProgramsFetched(true);
    }).catch(() => {
      setProgramsError('Failed to load programs');
      setProgramsLoading(false);
    });
  }, [user?.id, programsFetched]);

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
        selectedDifficulty === "all" ||
        item.labels?.difficulty?.toLowerCase() === selectedDifficulty;

      const allMuscles = [
        ...(item.labels?.primary ?? []),
        ...(item.labels?.secondary ?? [])
      ];

      const targetMuscles = selectedMuscle === "all"
        ? allMuscles
        : muscleGroupMap[selectedMuscle] ?? [selectedMuscle];

      const matchesMuscle =
        selectedMuscle === "all" ||
        allMuscles.some((muscle) => targetMuscles.includes(muscle));

      const matchesSpecificMuscle =
        selectedSpecificMuscle === "all" ||
        allMuscles.includes(selectedSpecificMuscle);

      return matchesSearch && matchesDifficulty && matchesMuscle && matchesSpecificMuscle;
    });
  }, [poses, deferredSearch, selectedDifficulty, selectedMuscle, selectedSpecificMuscle]);




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
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-lg leading-snug h-[3rem] break-words line-clamp-2">{pose.name}</h3>
            <div className="flex flex-wrap gap-2">
              {/* Difficulty badge */}
              {pose.labels?.difficulty && (
                <Badge variant="secondary" className={`${difficultyColors[pose.labels.difficulty]} text-white `}>
                  {pose.labels.difficulty === "Easy"
                    ? "Beginner"
                    : pose.labels.difficulty === "Medium"
                      ? "Intermediate"
                      : pose.labels.difficulty === "Hard"
                        ? "Advanced"
                        : pose.labels.difficulty}
                </Badge>
              )}
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
        description={paidStatus ? "Select from our curated collection of AI-powered yoga poses, programs, or make your own!" : "Start your yoga journey with AI-powered guidance"}
        backHref="/practice"
      />
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Tabs Switcher */}
        <Tabs value={tab} onValueChange={setTab} className="mb-8">
          <div className="w-full flex items-center justify-center">
            <TabsList className="w-full max-w-[500px] bg-gray-200">
              <TabsTrigger value="poses" className="cursor-pointer data-[state=active]:rounded-xl">
                Poses
              </TabsTrigger>
              <TabsTrigger value="programs" className="cursor-pointer data-[state=active]:rounded-xl">
                Programs
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Pose Selection Tab */}
          <TabsContent value="poses">
            {/* Search and Filter Section */}
            <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    className="w-full pl-12 pr-4 h-12 rounded-full border-2 bg-background/50"
                    placeholder="Search poses..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {/* Filtering */}
                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.div
                      key="filters"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex gap-3 flex-col sm:flex-row"
                    >
                      {/* ...Filters... */}
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Difficulty level:
                        </label>
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="easy">Beginner</SelectItem>
                            <SelectItem value="medium">Intermediate</SelectItem>
                            <SelectItem value="hard">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Muscle group:
                        </label>
                        <Select
                          value={selectedMuscle}
                          onValueChange={(value) => {
                            setSelectedMuscle(value);
                            if (value === "all") {
                              setSelectedSpecificMuscle("all");
                            }
                          }}
                        >

                          <SelectTrigger>
                            <SelectValue placeholder="Select muscle group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="core">Core</SelectItem>
                            <SelectItem value="back">Back</SelectItem>
                            <SelectItem value="shoulders">Shoulders</SelectItem>
                            <SelectItem value="chest">Chest</SelectItem>
                            <SelectItem value="arms">Arms</SelectItem>
                            <SelectItem value="legs">Legs</SelectItem>
                            <SelectItem value="glutes">Glutes</SelectItem>
                            <SelectItem value="hips">Hips</SelectItem>
                            <SelectItem value="neck">Neck</SelectItem>
                            <SelectItem value="feet_ankles">Feet & Ankles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {
                        <div className="flex items-center gap-1">
                          <div className={`flex items-center gap-1 ${(selectedMuscle == "all") && "hidden"}`}>
                            <label className="text-sm font-medium whitespace-nowrap">Specific muscle:</label>
                            <Select
                              value={selectedSpecificMuscle}
                              onValueChange={setSelectedSpecificMuscle}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select specific muscle" />
                              </SelectTrigger>
                              <SelectContent className="">
                                <SelectItem value="all">All</SelectItem>
                                {(muscleGroupMap[selectedMuscle] ?? []).map((muscle) => (
                                  <SelectItem key={muscle} value={muscle}>
                                    {muscle.replaceAll("_", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      }
                    </motion.div>)}
                </AnimatePresence>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 h-4 w-fit p-0 px-2 border-gray-300"
                  onClick={() => setShowFilters(prev => !prev)}
                >
                  <p className="font-light text-gray-500 text-sm">{showFilters ? "hide" : "show"} filters</p>
                  <motion.span
                    initial={false}
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown color="gray" className="w-4 h-4" />
                  </motion.span>
                </Button>


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
                            No poses found for your current search.                          </motion.div>
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
                <div className="relative flex-1 w-full flex items-center gap-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    className="w-full pl-12 pr-4 h-12 rounded-full border-2 bg-background/50"
                    placeholder="Search programs..."
                    type="text"
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                  />
                  {paidStatus && (
                    <Button
                      variant="default"
                      className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg ml-2"
                      aria-label="Add Program"
                      onClick={() => setAddProgramOpen(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                  )}
                </div>
                {/* Filter Popover */}
                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.div
                      key="program-filters"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex gap-3 flex-col sm:flex-row"
                    >
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-medium">
                          Difficulty:
                        </label>
                        <Select value={selectedProgramDifficulty} onValueChange={setSelectedProgramDifficulty} disabled={programSourceFilter === 'user'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="easy">Beginner</SelectItem>
                            <SelectItem value="medium">Intermediate</SelectItem>
                            <SelectItem value="hard">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-medium">
                          Source:
                        </label>
                        <Select value={programSourceFilter} onValueChange={v => setProgramSourceFilter(v as 'all' | 'premade' | 'user')}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="premade">Yotion-Select</SelectItem>
                            <SelectItem value="user">User-Created</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 h-4 w-fit p-0 px-2 border-gray-300"
                  onClick={() => setShowFilters(prev => !prev)}
                >
                  <p className="font-light text-gray-500 text-sm">{showFilters ? "hide" : "show"} filters</p>
                  <motion.span
                    initial={false}
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown color="gray" className="w-4 h-4" />
                  </motion.span>
                </Button>
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
                      (
                        searchedPrograms
                          .filter((program) =>
                            programSourceFilter === 'all' ? true :
                              programSourceFilter === 'premade' ? !program.isUser :
                                program.isUser
                          )
                          .sort((a, b) => {
                            // Define difficulty order
                            const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

                            // User programs should come after all difficulty-defined programs
                            if (a.isUser && !b.isUser) return 1;
                            if (!a.isUser && b.isUser) return -1;

                            // If both are user programs or both are not user programs, sort by difficulty
                            if (a.isUser && b.isUser) {
                              // Both are user programs - sort alphabetically
                              return a.name.localeCompare(b.name);
                            }

                            // Both are non-user programs - sort by difficulty first, then alphabetically
                            const difficultyA = a.difficulty || 'Hard';
                            const difficultyB = b.difficulty || 'Hard';

                            // Compare difficulties first
                            const difficultyComparison = difficultyOrder[difficultyA] - difficultyOrder[difficultyB];

                            // If difficulties are the same, sort alphabetically by name
                            if (difficultyComparison === 0) {
                              return a.name.localeCompare(b.name);
                            }

                            return difficultyComparison;
                          })
                          .map((program) => (
                            <div key={program.id} className="relative group">
                              <SessionCard session={program} locked={!paidStatus} />
                              {program.isUser && (
                                <button
                                  className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-white"
                                  onClick={() => { setSelectedProgram(program as Session); setEditProgramOpen(true); }}
                                  title="Edit Program"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487a2.1 2.1 0 1 1 2.97 2.97L7.5 20.79l-4 1 1-4 14.362-14.303z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))
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
                    className="col-span-full text-center text-muted-foreground italic h-24"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  <X className="w-6 h-6" />
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
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <h1 className="text-sm">Primary muscles worked:</h1>
                      <div className="flex gap-2">
                        {selectedPose.labels?.primary?.map((muscle: string) => (
                          <Badge key={`primary-${muscle}`} variant="secondary" className="bg-blue-300">
                            {muscle.replaceAll("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h1 className="text-sm">Secondary muscles worked:</h1>
                      <div className="flex gap-2">
                        {selectedPose.labels?.secondary?.map((muscle: string) => (
                          <Badge key={`secondary-${muscle}`} variant="secondary" className="bg-blue-200">
                            {muscle.replaceAll("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
        <AddProgramModal
          open={editProgramOpen}
          onClose={() => { setEditProgramOpen(false); setSelectedProgram(null); }}
          onCreate={() => { setEditProgramOpen(false); setSelectedProgram(null); setProgramsFetched(false); }}
          onDelete={(id) => {
            setEditProgramOpen(false);
            setSelectedProgram(null);
            setPrograms((prev) => prev.filter((p) => String(p.id) !== String(id)));
          }}
          userId={user?.id || ''}
          editing={true}
          initialProgram={selectedProgram ?? undefined}
        />
        <AddProgramModal
          open={addProgramOpen}
          onClose={() => setAddProgramOpen(false)}
          onCreate={() => {
            setAddProgramOpen(false);
            setProgramsFetched(false);
          }}
          userId={user?.id || ''}
        />
      </section>
    </main>
  );
}
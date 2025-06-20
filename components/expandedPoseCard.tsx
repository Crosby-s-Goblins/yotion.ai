'use client'

import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ArrowLeftFromLine, X } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Pose {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  benefits?: string[];
}

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
} as const;

const poses: Pose[] = [
  { 
    name: 'Warrior I', 
    difficulty: 'Easy', 
    description: 'A foundational standing pose that builds strength and stability.',
    benefits: ['Strengthens legs and core', 'Improves balance', 'Opens chest and shoulders'],
  },
  { name: 'Tree', difficulty: 'Medium' },
  { name: 'Downward Dog', difficulty: 'Hard' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
];

const PoseItem = ({ name, difficulty, onClick, isExpanded }: Pose & { onClick: () => void; isExpanded: boolean }) => (
  <motion.div 
    className="flex flex-col cursor-pointer"
    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
  >
    <div className="flex flex-row py-4 px-8 items-center justify-between">
      <p className="font-medium">{name}</p>
      <div className={`flex flex-row ${difficultyColors[difficulty]} px-6 py-2 rounded-full w-28 justify-center items-center`}>
        <p className="text-white text-sm font-medium">{difficulty}</p>
      </div>
    </div>
    {!isExpanded && <hr className="border-gray-200 -mx-8" />}
  </motion.div>
);

const ExpandedPoseCard = ({ pose, onClose }: { pose: Pose; onClose: () => void }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden w-[90vw] max-w-4xl h-[80vh] max-h-[600px]"
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-6 justify-center w-full">
            <h2 className="text-3xl font-bold">{pose.name}</h2>
            {/* <div className={`${difficultyColors[pose.difficulty]} px-6 py-3 rounded-full`}>
              <span className="text-white text-lg font-medium">{pose.difficulty}</span>
            </div> */}
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex p-8 overflow-y-auto">
          <div className="bg-gray-500 aspect-square w-96 h-96"></div>
          <div className="flex flex-col ml-16 mr-16 justify-between">
            {pose.description && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{pose.description}</p>
              </div>
            )}
            {pose.benefits && pose.benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Benefits</h3>
                <ul className="space-y-3">
                  {pose.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button className="rounded-3xl h-12 bg-blue-500">
              <p className="text-white text-lg">Start</p>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default function SelectionComponents() {
  const [expandedPose, setExpandedPose] = useState<number | null>(null);

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

  const [search, setSearch] = useState('');

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
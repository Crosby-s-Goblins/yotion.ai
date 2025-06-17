'use client'

import React, { useState } from "react";
import { motion } from 'framer-motion';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface Pose {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string
}

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
} as const;

const poses: Pose[] = [
  { name: 'Warrior I', difficulty: 'Easy', description:'I love yoga it is so fun and cool' },
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
  { name: 'Test', difficulty: 'Medium' },
  { name: 'Test', difficulty: 'Medium' },
]; //May want to link this to a file or something

const PoseItem = ({ name, difficulty }: Pose) => (
  
  <div className="flex flex-col">
    <div className="flex flex-row py-2 px-8 items-center justify-between">
      <p>{name}</p>
      <div className={`flex flex-row ${difficultyColors[difficulty]} px-8 py-2 rounded-2xl w-32 justify-center items-center`}>
        <p className="text-white">{difficulty}</p>
      </div>
    </div>
    <hr className="border-gray-200 -mx-8" />
  </div>
);

export default function PracticePage() {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedPose, setExpandedPose] = useState(null);

    const handleClick = (index) => {
    if (expandedPose === index) {
      setIsExpanded(false);
      setExpandedPose(null);
    } else {
      setIsExpanded(true);
      setExpandedPose(index);
    }
  };

  return (
    <main className="h-screen flex flex-col items-center -mt-10 justify-center">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Welcome to Your Practice</h1>
        <p className="text-muted-foreground mt-2">
          Start your yoga journey with AI-powered guidance
        </p>
      </div>

      <div className="w-full max-w-2xl px-4 mb-6">
          <Input className="flex flex-row rounded-3xl border-2 py-6 px-8" placeholder="Search"/>
      </div>

      <div className="w-full max-w-2xl px-4">
        <div className="bg-white rounded-3xl border-2 h-full overflow-hidden">
          <ScrollArea className="h-[700px] rounded-3xl">
            <div className="pr-4 -mr-4">
              {poses.map((pose, index) => (
                <motion.div
                  key={index}
                  className={`relative ${isExpanded && expandedPose === index ? 'w-full h-[400px]' : 'w-full'} transition-all duration-500 ease-in-out`}
                  onClick={() => handleClick(index)}
                >
                  <PoseItem key={index} {...pose} />
                  {isExpanded && expandedPose === index && (
                    <motion.div
                      className="absolute inset-0 bg-gray-300 bg-opacity-50 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="absolute bottom-4 left-4 text-sm p-4 rounded-xl">
                        {pose.description}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}

/* {poses.map((pose, index) => (
                <PoseItem key={index} {...pose} />
              ))} */
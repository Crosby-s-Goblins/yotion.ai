'use client'

import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface Pose {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
} as const;

const poses: Pose[] = [
  { name: 'Warrior I', difficulty: 'Easy' },
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
];

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
  return (
    <main className="h-screen flex flex-col items-center pt-6">
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
          <ScrollArea className="h-[600px] rounded-3xl">
            <div className="pr-4 -mr-4">
              {poses.map((pose, index) => (
                <PoseItem key={index} {...pose} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}
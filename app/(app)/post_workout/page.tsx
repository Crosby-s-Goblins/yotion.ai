'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PostWorkoutPage() {
  
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

    return (
        <main className="relative flex flex-col items-center w-full min-h-screen bg-white">

            <div className="mt-12 mb-8">
                <h1 className="text-3xl font-semibold">Congratulations!</h1>
            </div>
            
            <section className="w-full max-w-xl bg-gray-100 rounded-2xl shadow p-8 flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Your Workout Statistics</h2>
                <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span className="text-gray-700">--:--</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Calories Burned:</span>
                        <span className="text-gray-700">---</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Poses Completed:</span>
                        <span className="text-gray-700">---</span>
                    </div>
                </div>
            </section>
            <div className="flex flex-row gap-2 z-10 mt-8">
                <Link href="/selection">
                    <Button className="w-max">Return to selection</Button>
                </Link>
                <Link href="/skele">
                    <Button className="w-max">Return to video camera</Button>
                </Link>
            </div>
        </main>
    )
}
'use client'

import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from './user-provider';

export function Hero() {
  const user = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const handleStartTraining = () => {
    if (isLoggedIn) {
      router.push("/practice");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center px-4 md:px-8">
      <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-center bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent drop-shadow-lg animate-fade-in">
        Your Personal Yoga Coach, Upgraded with AI
      </h1>
      <p className="text-lg sm:text-xl text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in delay-100">
        Track. Align. Improve — effortlessly. Experience real-time feedback, personalized analytics, and a vibrant community.
      </p>
      <div className="flex gap-4 animate-fade-in delay-200">
        {isLoggedIn ? (
          <Button className="px-10 py-4 text-lg shadow-glass" size="lg" onClick={handleStartTraining}>
            Start Training
          </Button>
        ) : (
          <>
            <Button className="px-8 py-4 text-lg" size="lg" variant="outline" asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
            <Button className="px-8 py-4 text-lg" size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </>
        )}
      </div>
      <div className="w-full max-w-3xl aspect-[3/2] bg-card.glass rounded-2xl shadow-glass flex items-center justify-center mt-10 backdrop-blur-md border border-border animate-fade-in delay-300">
        <p className="text-base sm:text-lg text-gray-500">
          [ScreenStudio Demo Coming Soon]
        </p>
      </div>
      <div className="w-full p-[1.5px] bg-gradient-to-r from-transparent via-primary/20 to-transparent my-10 rounded-full animate-fade-in delay-400" />
    </div>
  );
}

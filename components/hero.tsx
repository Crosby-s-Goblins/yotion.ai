'use client'

import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    
    // Get initial user state
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
  
    getUser();
  
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });
  
    return () => subscription.unsubscribe();
  }, []);

  const handleStartTraining = () => {
    if (isLoggedIn) {
      router.push("/practice");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center px-4 md:px-8">
        <h1 className="font-medium text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
          Your Personal Yoga Coach, Upgraded with AI.
        </h1>
        <p className="text-base sm:text-lg text-center text-muted-foreground">
          Track. Align. Improve — effortlessly.
        </p>
        <div className="flex gap-2">
          <Button className="px-8 py-6 text-md" onClick={handleStartTraining} asChild> 
            <Link href="/practice">Start Training</Link>
          </Button>
        </div>
        <div className="w-full max-w-[1200px] aspect-[3/2] bg-gray-200 rounded shadow flex items-center justify-center mt-8">
          <p className="text-sm sm:text-base">
            Placeholder for ScreenStudio Demo
          </p>
        </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}

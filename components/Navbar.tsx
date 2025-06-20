'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogoutButton } from './logout-button';
import Link from 'next/link';
import { Button } from './ui/button';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    
    // Get initial user state
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        setUser(user);

        if (user) {
          // get profile info
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
          if (profileData) setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setIsLoggedIn(!!session?.user);
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="w-full border-b border-b-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand - Left aligned */}
            <div className="flex items-center w-1/3 justify-start">
              <Link href="/" className="text-xl font-bold">
                yotion.ai
              </Link>
            </div>

            {/* Navigation Links - Center aligned */}
            <div className="hidden md:flex items-center space-x-8 w-1/3 justify-center">
              <Link href="/about" className="text-foreground/60 hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-foreground/60 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-foreground/60 hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            {/* Auth Buttons - Right aligned */}
            <div className="flex items-center space-x-4 w-1/3 justify-end">
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b border-b-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - Left aligned */}
          <div className="flex items-center w-1/3 justify-start">
            <Link href="/" className="text-xl font-bold">
              yotion.ai
            </Link>
          </div>

          {/* Navigation Links - Center aligned */}
          <div className="hidden md:flex items-center space-x-8 w-1/3 justify-center">
            <Link href="/about" className="text-foreground/60 hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-foreground/60 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-foreground/60 hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Buttons - Right aligned */}
          <div className="flex items-center space-x-4 w-1/3 justify-end">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-foreground/60">
                  <span className='hidden lg:flex'>Welcome, </span>{profile?.username || "..."}
                </span>
                <Avatar>
                  <AvatarImage src={profile?.avatar_url} alt="avatar"/>
                  <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogoutButton } from './logout-button';
import Link from 'next/link';
import { Button } from './ui/button';
import { useUser } from './user-provider';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default function Navbar() {
  const user = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setIsLoggedIn(true);
      // get profile info
      const supabase = createClient();
      supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data: profileData }) => {
          if (profileData) setProfile(profileData);
        });
    } else {
      setIsLoggedIn(false);
      setProfile(null);
    }
  }, [user]);

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
                  <span className='hidden lg:flex'>{profile?.username || "..."}</span>
                </span>
                <HoverCard openDelay={0}>
                  <HoverCardTrigger asChild>
                    <a href='/settings'>
                      <Avatar>
                        <AvatarImage src={profile?.avatar_url} alt="avatar"/>
                        <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className='flex flex-col items-left gap-2'>
                      <div className='flex flex-col'>
                        <p className='opacity-50'>Logged in as:</p>
                        <p>{user?.email}</p>
                      </div>
                      <Button variant="outline" asChild><a href='/settings'>profile settings</a></Button>
                      <LogoutButton/>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <span className='hidden md:flex'><LogoutButton/></span>
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
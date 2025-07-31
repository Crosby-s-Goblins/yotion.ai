'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogoutButton } from './logout-button';
import Link from 'next/link';
import { Button } from './ui/button';
import { useUser } from './user-provider';
import { Menu, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface Profile {
  username?: string;
  avatar_url?: string;
}

export default function Navbar() {
  const user = useUser() as { id?: string; email?: string } | null;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMobileMenuOpen(false);
    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="w-full border-b border-b-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand - Left aligned */}
            <div className="flex items-center">
              <Link href="/" className="text-lg sm:text-xl font-bold">
                yotion.ai
              </Link>
            </div>

            {/* Navigation Links - Center aligned (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/about" className="text-sm lg:text-base text-foreground/60 hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-sm lg:text-base text-foreground/60 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-sm lg:text-base text-foreground/60 hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            {/* Auth Buttons - Right aligned */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-16 sm:w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
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
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-bold">
              yotion.ai
            </Link>
          </div>

          {/* Navigation Links - Center aligned (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/about" className="text-sm lg:text-base text-foreground/60 hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-sm lg:text-base text-foreground/60 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm lg:text-base text-foreground/60 hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Buttons - Right aligned */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="hidden lg:block text-sm text-foreground/60">
                  {profile?.username || "..."}
                </span>
                <HoverCard openDelay={0}>
                  <HoverCardTrigger asChild>
                    <a href='/settings'>
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={profile?.avatar_url} alt="avatar"/>
                        <AvatarFallback className="text-xs sm:text-sm">{profile?.username?.[0]?.toUpperCase() || ''}</AvatarFallback>
                      </Avatar>
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent className='bg-white'>
                    <div className='flex flex-col items-left gap-2'>
                      <div className='flex flex-col'>
                        <p className='opacity-50 text-sm'>Logged in as:</p>
                        <p className='text-sm'>{user?.email}</p>
                      </div>
                      <Button variant="outline" asChild size="sm"><a href='/settings'>Profile Settings</a></Button>
                      <LogoutButton/>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <div className="hidden md:block">
                  <LogoutButton/>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-foreground/10 bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/about"
                className="block px-3 py-2 text-base text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-base text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 text-base text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <div className="px-3 py-2">
                    <LogoutButton/>
                  </div>
                </>
              )}
              {!isLoggedIn && (
                <div className="px-3 py-2 space-y-2">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
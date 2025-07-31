"use client";

import { Card } from "@/components/ui/card";
import { Settings, Users, ChartNoAxesCombined, Flame } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNavigationDirection } from "@/context/NavigationDirectionContext";
import { flushSync } from "react-dom";

export default function PracticePage() {
  const router = useRouter();
  const { setDirection } = useNavigationDirection();

  const handleNav = (href: string) => {
    flushSync(() => {
      setDirection("forward");
    });
    // Small delay to ensure context propagates
    setTimeout(() => {
      router.push(href);
    }, 10);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      {/* Custom Hero Header */}
      <header className="w-full mx-auto px-12 pt-12 mb-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent drop-shadow-lg mb-4 hover:opacity-50">
            <Link href="/">yotion.ai</Link>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered yoga journey starts here. Choose your path to mindfulness and strength.
          </p>
        </div>
      </header>
      
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 2xl:grid-cols-4 gap-6 w-full">
        {/* Train Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer aspect-square">
          <button
            onClick={() => handleNav("/selection")}
            className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 bg-transparent border-none outline-none"
            style={{ cursor: "pointer" }}
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
                Train
              </h3>
              <p className="hidden sm:block text-sm text-muted-foreground leading-tight px-2">
                Get real-time feedback with AI-powered guidance
              </p>
            </div>
          </button>
        </Card>

        {/* Performance Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer aspect-square">
          <button
            onClick={() => handleNav("/performance")}
            className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 bg-transparent border-none outline-none"
            style={{ cursor: "pointer" }}
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ChartNoAxesCombined className="w-12 h-12 sm:w-14 sm:h-14 text-accent" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">
                Performance
              </h3>
              <p className="hidden sm:block text-sm text-muted-foreground leading-tight px-2">
                Track progress with detailed analytics and insights
              </p>
            </div>
          </button>
        </Card>

        {/* Community Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer aspect-square">
          <button
            onClick={() => handleNav("/community")}
            className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 bg-transparent border-none outline-none"
            style={{ cursor: "pointer" }}
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-premium/10 to-yellow-200/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-12 h-12 sm:w-14 sm:h-14 text-premium" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-tr from-premium to-yellow-200 bg-clip-text text-transparent">
                Community
              </h3>
              <p className="hidden sm:block text-sm text-muted-foreground leading-tight px-2">
                Connect with yogis and participate in challenges
              </p>
            </div>
          </button>
        </Card>

        {/* Settings Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer aspect-square">
          <button
            onClick={() => handleNav("/appSettings")}
            className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 bg-transparent border-none outline-none"
            style={{ cursor: "pointer" }}
          >
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-gray-500/10 to-gray-400/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-12 h-12 sm:w-14 sm:h-14 text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
                Settings
              </h3>
              <p className="hidden sm:block text-sm text-muted-foreground leading-tight px-2">
                Customize experience and manage preferences
              </p>
            </div>
          </button>
        </Card>
        </div>
      </section>
    </main>
  );
} 
import { NextLogo } from "./next-logo";
import { SupabaseLogo } from "./supabase-logo";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <div className="flex flex-col gap-4 items-center px-4 md:px-8">
      <div className="flex gap-8 justify-center items-center">
      </div>
        <h1 className="font-medium text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
          Your Personal Yoga Coach, Upgraded with AI.
        </h1>
        <p className="text-base sm:text-lg text-center text-muted-foreground">
          Track. Align. Improve — effortlessly.
        </p>
        <div className="flex gap-2">
          <Button>
            Launch
          </Button>
          <Button>
            Sign Up
          </Button>
        </div>
        <div className="w-full max-w-[1200px] aspect-[3/2] md:aspect-[3/2] bg-gray-200 rounded shadow flex items-center justify-center mt-16">
          <p className="text-sm sm:text-base">
            Placeholder for ScreenStudio Demo
          </p>
        </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}

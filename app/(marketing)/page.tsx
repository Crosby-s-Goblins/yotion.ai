import { Hero } from "@/components/hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center mt-20">
      <div className="animate-in flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <Hero />
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
      </footer>
    </div>
  );
} 
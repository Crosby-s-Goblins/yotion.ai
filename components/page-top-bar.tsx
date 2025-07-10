'use client'

import { ArrowLeftFromLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNavigationDirection } from "@/context/NavigationDirectionContext";
import { flushSync } from "react-dom";

export default function PageTopBar({ title, description, backHref }: { title: string; description?: string; backHref?: string }) {
  const router = useRouter();
  const { setDirection } = useNavigationDirection();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    flushSync(() => {
      setDirection("backward");
    });
    // Small delay to ensure context propagates
    setTimeout(() => {
      if (backHref) router.push(backHref);
    }, 10);
  };

  return (
    <header className="w-full mx-auto px-12 pt-12 mb-12">
      <div className="flex items-center gap-4 mb-2">
        {backHref && (
          <button
            onClick={handleBack}
            className="flex items-center text-muted-foreground hover:text-primary transition-colors bg-transparent border-none outline-none"
            aria-label="Back"
            type="button"
          >
            <ArrowLeftFromLine className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-2xl font-bold flex-1 text-center">{title}</h1>
        {/* Spacer for symmetry */}
        {backHref && <div className="w-6 h-6" />}
      </div>
      {description && <p className="text-muted-foreground text-center">{description}</p>}
    </header>
  );
} 
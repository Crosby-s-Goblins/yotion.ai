import { Input } from "@/components/ui/input";
import { ArrowLeftFromLine, Settings } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import PageTopBar from "@/components/page-top-bar";

export default function AppSettingsPage() {
  return (
    <main className="h-screen flex flex-col items-center">
      <PageTopBar
        title="Settings"
        description="Customize and manage your experience"
        backHref="/practice"
      />
    </main>
  );
} 
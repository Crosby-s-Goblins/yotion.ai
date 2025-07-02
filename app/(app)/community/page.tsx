import PageTopBar from "@/components/page-top-bar";
import { Input } from "@/components/ui/input";
import { ArrowLeftFromLine } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <main className="h-screen flex flex-col items-center">
      <PageTopBar 
        title="Community"
        description="Engage and compete with fellow yogi!"
        backHref="/practice"
      />
    </main>
  );
} 
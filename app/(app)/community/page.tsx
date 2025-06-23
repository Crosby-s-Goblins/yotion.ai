import { Input } from "@/components/ui/input";
import { ArrowLeftFromLine } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <main className="h-screen flex flex-col items-center">
      <div className="flex w-screen">
        <div className="flex w-1/3 justify-start pl-16">  
          <Link href="/practice">
            <ArrowLeftFromLine className=""/>
          </Link>
        </div>
        <div className="flex w-1/3 justify-center">
          <h1>Header</h1>
        </div>
        <div className="flex w-1/3">
        </div>
      </div>
    </main>
  );
} 
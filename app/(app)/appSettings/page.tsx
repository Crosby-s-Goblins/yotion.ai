import { Input } from "@/components/ui/input";
import { ArrowLeftFromLine, Settings } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function AppSettingsPage() {
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col text-center">
        <div className="flex w-screen items-center">
          <div className="flex basis-1/3 justify-start pl-16">  
            <Link href="/practice">
              <ArrowLeftFromLine className=""/>
            </Link>
          </div>
          <div className="flex basis-1/3 justify-center"> 
            <h1 className="text-2xl font-bold flex items-center gap-2">Settings
              <Settings className="w-6 h-6"/>
            </h1>
          </div>
          <div className="flex basis-1/3">
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Manage your app settings
        </p>
      </div>
    </main>
  );
} 
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* App Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/practice" className="flex items-center font-bold">
                yotion.ai
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/practice" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Practice
                </Link>
                <Link href="/practice/poses" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Poses
                </Link>
                <Link href="/practice/progress" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Progress
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-4">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 
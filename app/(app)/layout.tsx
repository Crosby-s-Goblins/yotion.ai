import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TimerProviderWrapper } from "@/components/TimerProviderWrapper";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return <TimerProviderWrapper>{children}</TimerProviderWrapper>;
}

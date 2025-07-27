import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TimerProviderWrapper } from "@/components/TimerProviderWrapper";
import { TTSProvider } from "@/context/TextToSpeechContext";
import { PreferencesProvider } from "@/context/UserPreferencesContext";
import { NavigationDirectionProvider } from "@/context/NavigationDirectionContext";
import { UserProvider } from '@/components/user-provider';
import { ProgramSessionProvider } from '@/context/ProgramSessionContext';

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

  return (
    <PreferencesProvider>
      <NavigationDirectionProvider>
        <TimerProviderWrapper>
          <TTSProvider>
            <UserProvider>
              <ProgramSessionProvider>
                {children}
              </ProgramSessionProvider>
            </UserProvider>
          </TTSProvider>
        </TimerProviderWrapper>
      </NavigationDirectionProvider>
    </PreferencesProvider>
  );
}

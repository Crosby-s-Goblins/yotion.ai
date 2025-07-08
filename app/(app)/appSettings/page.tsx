import PageTopBar from "@/components/page-top-bar";
import SettingsPane from "@/components/appSettingPane";

export default function AppSettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <PageTopBar
        title="Settings & Preferences"
        description="Customize your experience and manage your account"
        backHref="/practice"
      />
      <section className="flex-1 w-full max-w-4xl mx-auto px-6 pb-8">
        <SettingsPane />
      </section>
    </main>
  );
} 
import PageTopBar from "@/components/page-top-bar";
import SettingsPane from "@/components/appSettingPane";

export default function AppSettingsPage() {
  return (
    <main className="h-screen flex flex-col items-center">
      <PageTopBar
        title="Settings"
        description="Customize and manage your experience"
        backHref="/practice"
      />
      <SettingsPane />
    </main>
  );
} 
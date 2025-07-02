import { ChartBarLabel } from "@/components/ui/chart-bar-label";
import PageTopBar from "@/components/page-top-bar";

export default function PerformancePage() {
  return (
    <main className="h-screen flex flex-col items-center">
      <PageTopBar
        title="Welcome to Your Practice"
        description="Start your yoga journey with AI-powered guidance"
        backHref="/practice"
      />
      <section className="w-full max-w-5xl mx-auto px-4 flex flex-col gap-12">
        <div className="flex w-full gap-8">
          <div className="w-1/2">
            <ChartBarLabel />
          </div>
          <div className="w-1/2">
            <ChartBarLabel />
          </div>
        </div>
        <div className="flex w-full gap-8">
          <div className="w-1/3">
            <ChartBarLabel />
          </div>
          <div className="w-1/3">
            <ChartBarLabel />
          </div>
          <div className="w-1/3">
            <ChartBarLabel />
          </div>
        </div>
      </section>
    </main>
  );
} 
import { ChartBarLabel } from "@/components/ui/chart-bar-label";
import PageTopBar from "@/components/page-top-bar";
import { ChartPieLabel } from "@/components/ui/chart-pie-label";
import { ChartLineDefault } from "@/components/ui/chart-line-default";

export default function PerformancePage() {
  return (
    <main className="h-screen flex flex-col items-center">
      <PageTopBar
        title="Welcome to Your Practice"
        description="Start your yoga journey with AI-powered guidance"
        backHref="/practice"
      />
      <section className="w-full max-w-5xl mx-auto px-4 flex flex-col gap-4">
        <div className="flex w-full gap-4">
          <div className="w-1/2">
            <ChartBarLabel />
          </div>
          <div className="w-1/2">
            <ChartPieLabel />
          </div>
        </div>
        <div className="flex w-full gap-4">
          <div className="w-1/3">
            <ChartLineDefault />
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
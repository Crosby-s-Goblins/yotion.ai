import { ChartBarLabel } from "@/components/ui/chart-bar-label";
import PageTopBar from "@/components/page-top-bar";
import { ChartPieLabel } from "@/components/ui/chart-pie-label";
import { ChartLineDefault } from "@/components/ui/chart-line-default";

export default function PerformancePage() {
  return (
    <main className="max-h-screen h-screen flex flex-col">
      <PageTopBar
        title="Performance"
        description="Gain insight into your skill, consistency, and overall yoga experience!"
        backHref="/practice"
      />
      <section className="w-full max-w-5xl mx-auto px-4 flex flex-col gap-4">
        <div className="flex w-full gap-4 justify-center">
          <div className="w-[400px]">
            <ChartBarLabel />
          </div>
          <div className="w-[400px]">
            <ChartPieLabel />
          </div>
        </div>
        <div className="flex w-full gap-4 justify-center">
          <div className="w-[400px]">
            <ChartLineDefault />
          </div>
          <div className="w-[400px]">
            <ChartBarLabel />
          </div>
        </div>
      </section>
    </main>
  );
} 
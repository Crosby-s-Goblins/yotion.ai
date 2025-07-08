import { ChartBarLabel } from "@/components/ui/chart-bar-label";
import PageTopBar from "@/components/page-top-bar";
import { ChartPieLabel } from "@/components/ui/chart-pie-label";
import { ChartLineDefault } from "@/components/ui/chart-line-default";

export default function PerformancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <PageTopBar
        title="Performance Analytics"
        description="Gain insight into your skill, consistency, and overall yoga experience with AI-powered analytics!"
        backHref="/practice"
      />
      
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">24</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-primary text-xl">📊</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">87%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center">
                <span className="text-accent text-xl">🎯</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-premium to-yellow-200 bg-clip-text text-transparent">7 days</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-premium/10 to-yellow-200/10 flex items-center justify-center">
                <span className="text-premium text-xl">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Row */}
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
              Weekly Progress
            </h3>
            <div className="w-full">
              <ChartBarLabel />
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">
              Pose Distribution
            </h3>
            <div className="w-full">
              <ChartPieLabel />
            </div>
          </div>
          
          {/* Bottom Row */}
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-tr from-premium to-yellow-200 bg-clip-text text-transparent">
              Consistency Trend
            </h3>
            <div className="w-full">
              <ChartLineDefault />
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
              Monthly Overview
            </h3>
            <div className="w-full">
              <ChartBarLabel />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 
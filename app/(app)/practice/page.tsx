import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, ChartNoAxesCombined, Flame } from 'lucide-react';

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent drop-shadow-lg mb-4">
          <a href='/' className="hover:opacity-80 transition-opacity">yotion.ai</a>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered yoga journey starts here. Choose your path to mindfulness and strength.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 max-w-7xl w-full">
        {/* Train Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer">
          <a href="/selection" className="w-full h-full flex flex-col justify-center items-center p-8">
            <CardHeader className="flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
                Train
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose from our curated list of poses and get real-time feedback on your form with AI-powered guidance.
              </p>
            </CardContent>
          </a>
        </Card>

        {/* Performance Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer">
          <a href="/performance" className="w-full h-full flex flex-col justify-center items-center p-8">
            <CardHeader className="flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ChartNoAxesCombined className="w-12 h-12 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track your progress with detailed analytics, insights, and personalized recommendations.
              </p>
            </CardContent>
          </a>
        </Card>

        {/* Community Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer">
          <a href="/community" className="w-full h-full flex flex-col justify-center items-center p-8">
            <CardHeader className="flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-premium/10 to-yellow-200/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-12 h-12 text-premium" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-tr from-premium to-yellow-200 bg-clip-text text-transparent">
                Community
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with fellow yogis, share achievements, and participate in challenges together.
              </p>
            </CardContent>
          </a>
        </Card>

        {/* Settings Card */}
        <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105 cursor-pointer">
          <a href="/appSettings" className="w-full h-full flex flex-col justify-center items-center p-8">
            <CardHeader className="flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-gray-500/10 to-gray-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-12 h-12 text-gray-500" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Customize your experience, manage preferences, and control your account settings.
              </p>
            </CardContent>
          </a>
        </Card>
      </div>
    </main>
  );
} 
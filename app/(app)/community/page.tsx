import PageTopBar from "@/components/page-top-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, TrendingUp, MessageCircle, Heart, Share2 } from "lucide-react";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <PageTopBar 
        title="Community Hub"
        description="Connect with fellow yogis, share achievements, and participate in challenges!"
        backHref="/practice"
      />
      
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pb-8">
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">1,247</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Challenges</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">12</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions Today</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-premium to-yellow-200 bg-clip-text text-transparent">342</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-premium/10 to-yellow-200/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-premium" />
              </div>
            </div>
          </div>
          
          <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-3xl font-bold bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">#47</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-500/10 to-gray-400/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Input
                className="w-full pl-4 pr-4 h-12 rounded-full border-2 bg-background/50 backdrop-blur-sm"
                placeholder="Search community posts..."
                type="text"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-12 px-6 rounded-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Posts
              </Button>
              <Button variant="outline" className="h-12 px-6 rounded-full">
                <Trophy className="w-4 h-4 mr-2" />
                Challenges
              </Button>
            </div>
          </div>
        </div>

        {/* Community Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Post */}
            <Card className="bg-card.glass border border-border/50 shadow-card overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sarah Johnson</CardTitle>
                    <p className="text-sm text-muted-foreground">Just completed 30 days of daily practice! 🧘‍♀️</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">Featured</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground mb-4">
                  "Incredible journey with yotion.ai! The AI feedback has completely transformed my practice. 
                  From struggling with basic poses to mastering advanced sequences - this app is a game-changer! 
                  Thank you to this amazing community for the support and motivation. 🙏"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Heart className="w-4 h-4 mr-2" />
                      24
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      8
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </CardContent>
            </Card>

            {/* Regular Post */}
            <Card className="bg-card.glass border border-border/50 shadow-card overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Mike Chen</CardTitle>
                    <p className="text-sm text-muted-foreground">New personal best in Warrior Pose! 💪</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground mb-4">
                  "Finally held Warrior II for 2 minutes straight! The breathing guidance feature really helped me focus. 
                  Anyone else working on balance poses this week?"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Heart className="w-4 h-4 mr-2" />
                      12
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      3
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Challenges */}
            <Card className="bg-card.glass border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-tr from-premium to-yellow-200 bg-clip-text text-transparent">
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-tr from-primary/5 to-accent/5 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">30-Day Consistency</h4>
                  <p className="text-sm text-muted-foreground mb-3">Practice every day for 30 days</p>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-gradient-to-tr from-primary to-accent h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                    <span className="text-sm font-medium">21/30</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-tr from-accent/5 to-primary/5 border border-accent/20">
                  <h4 className="font-semibold text-accent mb-2">Balance Master</h4>
                  <p className="text-sm text-muted-foreground mb-3">Master 5 balance poses</p>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-gradient-to-tr from-accent to-primary h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <span className="text-sm font-medium">3/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-card.glass border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
                  This Week's Leaders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Emma Wilson", score: "2,847", rank: 1 },
                  { name: "David Kim", score: "2,634", rank: 2 },
                  { name: "Lisa Park", score: "2,521", rank: 3 },
                  { name: "You", score: "2,198", rank: 4 },
                  { name: "Alex Rivera", score: "2,045", rank: 5 }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600 text-yellow-900' :
                        index === 1 ? 'bg-gradient-to-tr from-gray-300 to-gray-500 text-gray-700' :
                        index === 2 ? 'bg-gradient-to-tr from-amber-600 to-amber-800 text-amber-100' :
                        'bg-gradient-to-tr from-gray-100 to-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium ${user.name === "You" ? 'text-primary' : ''}`}>
                        {user.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
} 
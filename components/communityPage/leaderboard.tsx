'use client'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { useUser } from "../user-provider";

const Leaderboard = () => {

    return (
        <Card className="bg-card.glass border border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-tr from-gray-600 to-gray-500 bg-clip-text text-transparent">
                  This Week&apos;s Leaders
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
    );
}
 
export default Leaderboard;
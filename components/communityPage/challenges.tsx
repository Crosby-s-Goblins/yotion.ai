import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const Challenges = () => {
    return (
        <Card className="bg-card.glass border border-border/50 shadow-card" id="challenges-section">
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
    );
}
 
export default Challenges;
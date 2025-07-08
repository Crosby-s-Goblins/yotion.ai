import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProtectedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
              <InfoIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
                Welcome to Your Dashboard
              </h1>
              <p className="text-muted-foreground">You're successfully authenticated!</p>
            </div>
            <Badge variant="secondary" className="ml-auto">Protected</Badge>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            This is a protected page that you can only see as an authenticated user. 
            Your session is secure and your data is protected.
          </p>
        </div>

        {/* Next Steps Section */}
        <Card className="bg-card.glass border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">
              Getting Started
            </CardTitle>
            <p className="text-muted-foreground">
              Follow these steps to get the most out of your yotion.ai experience
            </p>
          </CardHeader>
          <CardContent>
            <FetchDataSteps />
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 
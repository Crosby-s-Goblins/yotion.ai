import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to Your Practice</h1>
        <p className="text-muted-foreground mt-2">
          Start your yoga journey with AI-powered guidance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <a href="/selection">
            <CardHeader>
            <CardTitle>Start a Session</CardTitle>
            <CardDescription>Begin a new yoga practice session</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose from our curated list of poses and get real-time feedback on your form.
            </p>
          </CardContent>
          </a>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your improvement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View your practice history and see how your form has improved.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Poses</CardTitle>
            <CardDescription>Explore our pose library</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse through our collection of yoga poses with detailed instructions.
            </p>
          </CardContent>
        </Card>

        <div></div>

        <Card>
          <CardHeader>
            <CardTitle>Available Poses</CardTitle>
            <CardDescription>Explore our pose library</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse through our collection of yoga poses with detailed instructions.
            </p>
          </CardContent>
        </Card>
        
        <div></div>

      </div>
    </div>
  );
} 
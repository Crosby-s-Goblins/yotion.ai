'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/user-provider";
import PageTopBar from "@/components/page-top-bar";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Award,
  Zap,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Dumbbell
} from "lucide-react";

interface InsightResponse {
  insights: string[];
  recommendations: string[];
  encouragement: string;
}

export default function PostWorkoutPage() {
    const user = useUser();
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<InsightResponse | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState<string | null>(null);
    const [weight, setWeight] = useState<number | null>(null);
    const [poseDifficulties, setPoseDifficulties] = useState<string[]>([]);

    useEffect(() => {
        const alreadyReloaded = sessionStorage.getItem('reloaded');

        if (!alreadyReloaded) {
            sessionStorage.setItem('reloaded', 'true');
            window.location.reload();
        } //Force reload to allow MediaPipe Startup?

        return () => {
            sessionStorage.removeItem('reloaded');
        };
    }, []);

    useEffect(() => {
        const fetchPerformance = async () => {
            if (!user?.id) return;
            setLoading(true);
            setError(null);
            try {
                const supabase = await createClient();
                const { data, error } = await supabase
                    .from('post_performance')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(1);
                if (error) {
                    setError(error.message);
                } else {
                    setPerformance(data && data.length > 0 ? data[0] : null);
                    console.log('[DEBUG] All fetched performance data:', data);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPerformance();
    }, [user?.id]);

    useEffect(() => {
        if (!performance || !user?.id) return;
        const fetchWeightAndDifficulties = async () => {
            const supabase = await createClient();

            // Fetch weight
            const { data: userPref, error: weightError, status, statusText } = await supabase
                .from('user_preferences')
                .select('weight')
                .eq('id', user.id)
                .single();
            console.log('[DEBUG] user_preferences fetch:', { userPref, weightError, status, statusText, userId: user.id });
            setWeight(userPref?.weight ?? null);

            // Fetch pose difficulties
            if (performance.exercises_performed?.length) {
                const { data: poses } = await supabase
                    .from('poseLibrary')
                    .select('difficulty, id, name')
                    .in('id', performance.exercises_performed);
                console.log('[DEBUG] poseLibrary fetch result:', poses);
                setPoseDifficulties(poses?.map((p: any) => p.difficulty) ?? []);
                if (poses) {
                    poses.forEach((p: any, idx: number) => {
                        console.log(`[DEBUG] Pose #${idx + 1}:`, p);
                    });
                }
            }
        };

        fetchWeightAndDifficulties();
    }, [performance, user?.id]);

    // Format duration nicely
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getAverageMET = () => {
        if (!poseDifficulties.length) return null;
        const metMap: Record<string, number> = { easy: 2.5, medium: 5.5, hard: 7.0 };
        const mets = poseDifficulties.map(d => metMap[d?.toLowerCase?.()] ?? 2.5);
        return mets.reduce((a, b) => a + b, 0) / mets.length;
    };
    getAverageMET()

    const getCaloriesBurned = () => {
        console.log('[DEBUG] getCaloriesBurned called with:', { performance, weight, poseDifficulties });
        if (!performance || !weight || !poseDifficulties.length) {
            console.log('[DEBUG] Missing data for calories:', { performance, weight, poseDifficulties });
            return '--';
        }
        const durationMin = performance.duration_s / 60;
        const perExerciseDuration = durationMin / poseDifficulties.length;
        const metMap: Record<string, number> = { easy: 2.5, medium: 5.5, hard: 7.0 };
        let totalCalories = 0;
        poseDifficulties.forEach((difficulty, idx) => {
            const met = metMap[difficulty?.toLowerCase?.()] ?? 2.5;
            const cal = perExerciseDuration * met * (weight / 60);
            totalCalories += cal;
            console.log(`[DEBUG] Exercise #${idx + 1} difficulty: ${difficulty}, MET: ${met}, per-exercise calories: ${cal}`);
        });
        console.log('[DEBUG] Total calories:', totalCalories);
        return Math.round(totalCalories);
    };

    // Fetch insights from Gemini API
    const fetchInsights = async () => {
        if (!performance) return;
        
        // Debug: Log what we're sending to the API
        console.log('[DEBUG] Sending performance data to insights API:', {
            exercises_performed: performance.exercises_performed,
            exercises_count: performance.exercises_performed?.length || 0,
            duration_s: performance.duration_s,
            accuracy_score: performance.accuracy_score,
            consistency_score: performance.consistency_score
        });
        
        setInsightsLoading(true);
        setInsightsError(null);
        
        try {
            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(performance)
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch insights');
            }
            
            const insightData: InsightResponse = await response.json();
            setInsights(insightData);
        } catch (err: any) {
            setInsightsError(err.message);
            console.error('Error fetching insights:', err);
        } finally {
            setInsightsLoading(false);
        }
    };

    // Auto-fetch insights when performance data is available
    useEffect(() => {
        if (performance && !loading) {
            fetchInsights();
        }
    }, [performance, loading]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
            <PageTopBar 
                title="Workout Complete!"
                description="Great job! Here's how you performed in your session"
                backHref="/practice"
            />
            
            <section className="flex-1 w-full max-w-6xl mx-auto px-6 pb-8">
                {/* Congratulations Badge */}
                <div className="flex justify-center mb-8 max-w-5xl mx-auto">
                    <Badge className="bg-gradient-to-r from-success/10 to-primary/10 text-success border-success/20 text-base px-6 py-2 hover:bg-gradient-to-r hover:from-success/10 hover:to-primary/10 hover:text-success">
                        <Award className="w-4 h-4 mr-2" />
                        Workout Complete!
                    </Badge>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto">
                    {/* Duration Card */}
                    <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Duration
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {loading ? '--:--' : performance ? formatDuration(performance.duration_s) : '--:--'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Time spent in session
                            </p>
                        </CardContent>
                    </Card>

                    {/* Accuracy Card */}
                    <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Overall Score
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent/10 to-success/10 flex items-center justify-center">
                                <Target className="w-4 h-4 text-accent" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-accent">
                                {loading ? '--' : performance ? `${Math.round(((performance.accuracy_score / 100) + (performance.consistency_score / 100))/2)}%` : '--'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pose form accuracy
                            </p>
                        </CardContent>
                    </Card>

                    {/* Consistency Card */}
                    <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Calories Burned
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-success/10 to-primary/10 flex items-center justify-center">
                                <Dumbbell className="w-4 h-4 text-success" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">
                                {loading ? '--' : getCaloriesBurned()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Movement stability
                            </p>
                        </CardContent>
                    </Card>

                    {/* Poses Completed Card */}
                    <Card className="group relative overflow-hidden bg-card.glass border-border/50 shadow-card hover:shadow-glass transition-all duration-300 hover:scale-105">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Poses Completed
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-premium/10 to-yellow-200/10 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-premium" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-premium">
                                {loading ? '--' : performance ? performance.exercises_performed.length : '--'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Exercises in session
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights Section */}
                <Card className="bg-card.glass border-border/50 shadow-card max-w-5xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
                                    <Lightbulb className="w-4 h-4 text-primary" />
                                </div>
                                AI-Powered Insights
                            </div>
                            {insights && !insightsLoading && (
                                <Button 
                                    onClick={fetchInsights}
                                    variant="outline" 
                                    size="sm"
                                    className="ml-auto"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {insightsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                                    <p className="text-muted-foreground">Analyzing your performance...</p>
                                </div>
                            ) : insightsError ? (
                                <div className="text-center py-8">
                                    <p className="text-red-500 mb-2">Error loading insights</p>
                                    <p className="text-sm text-muted-foreground mb-4">{insightsError}</p>
                                    <Button onClick={fetchInsights} variant="outline" size="sm">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Try Again
                                    </Button>
                                </div>
                            ) : insights ? (
                                <div className="space-y-6">
                                    {/* Encouragement Section */}
                                    <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                                        <p className="text-success font-medium text-center">
                                            {insights.encouragement}
                                        </p>
                                    </div>

                                    {/* Insights */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary" />
                                            Performance Insights
                                        </h3>
                                        <div className="space-y-2">
                                            {insights.insights.map((insight, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                                    <p className="text-muted-foreground leading-relaxed">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-accent" />
                                            Recommendations
                                        </h3>
                                        <div className="space-y-2">
                                            {insights.recommendations.map((recommendation, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                                                    <p className="text-muted-foreground leading-relaxed">{recommendation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                                        <BarChart3 className="w-8 h-8 text-primary" />
                                    </div>
                                    <p className="text-muted-foreground mb-4">
                                        Ready to generate personalized insights from your workout data!
                                    </p>
                                    <Button onClick={fetchInsights} variant="outline">
                                        <Lightbulb className="w-4 h-4 mr-2" />
                                        Generate Insights
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 max-w-5xl mx-auto">
                    <Link href="/selection">
                        <Button className="w-full sm:w-auto">
                            <Zap className="w-4 h-4 mr-2" />
                            Practice Again
                        </Button>
                    </Link>
                    <Link href="/skele">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Back to Session
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}

'use client'
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/user-provider";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PostWorkoutPage() {
    const user = useUser();
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                const supabase = (await import("@/lib/supabase/client")).createClient();
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

    return (
        <main className="relative flex flex-col items-center w-full min-h-screen bg-white">
            <div className="mt-12 mb-8">
                <h1 className="text-3xl font-semibold">Congratulations!</h1>
            </div>

            <section className="w-full max-w-xl bg-gray-100 rounded-2xl shadow p-8 flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Your Workout Statistics</h2>
                <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span className="text-gray-700">{performance ? performance.duration_s + 's' : '--:--'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Accuracy score:</span>
                        <span className="text-gray-700">{performance ? (performance.accuracy_score / 100).toFixed(2) : '--'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Consistency score:</span>
                        <span className="text-gray-700">{performance ? (performance.consistency_score / 100).toFixed(2) : '--'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Calories Burned:</span>
                        <span className="text-gray-700">---</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Poses Completed:</span>
                        <span className="text-gray-700">{performance ? performance.exercises_performed.length : '---'}</span>
                    </div>
                </div>
                {error && <div className="text-red-500 mt-4">{error}</div>}
                {loading && <div className="text-gray-500 mt-4">Loading...</div>}
            </section>
            <div className="flex flex-row gap-2 z-10 mt-8">
                <Link href="/selection">
                    <Button className="w-max">Return to selection</Button>
                </Link>
                <Link href="/skele">
                    <Button className="w-max">Return to video camera</Button>
                </Link>
            </div>
        </main>
    );
}

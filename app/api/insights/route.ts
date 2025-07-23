import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutInsights, validateGeminiSetup } from "@/lib/gemini/insights";

export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!validateGeminiSetup()) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Parse the request body
    const rawPerformanceData = await request.json();

    // Debug: Log the exercises_performed data
    console.log('[DEBUG] Raw performance data received:', {
      exercises_performed: rawPerformanceData.exercises_performed,
      exercises_count: rawPerformanceData.exercises_performed?.length || 0,
      all_fields: Object.keys(rawPerformanceData)
    });

    // Validate required fields
    if (!rawPerformanceData.duration_s || !rawPerformanceData.accuracy_score || !rawPerformanceData.consistency_score) {
      return NextResponse.json(
        { error: "Missing required performance data" },
        { status: 400 }
      );
    }

    // Uniqueness check for poses
    const uniquePoseIds = Array.from(new Set(
      (rawPerformanceData.exercises_performed || []).map((id: string | number) => {
        const str = String(id);
        return str.endsWith('R') ? str.slice(0, -1) : str;
      })
    ));

    // Normalize the performance data to ensure consistent 0-100 scale
    const performanceData = {
      ...rawPerformanceData,
      exercises_performed: uniquePoseIds,
      // Normalize accuracy_score to 0-100 range (assuming it might be stored as 0-10000)
      accuracy_score: rawPerformanceData.accuracy_score > 100 
        ? Math.round(rawPerformanceData.accuracy_score / 100) 
        : Math.round(rawPerformanceData.accuracy_score),
      // Ensure consistency_score is in 0-100 range
      consistency_score: rawPerformanceData.consistency_score > 100
        ? Math.round(rawPerformanceData.consistency_score / 100)
        : Math.round(rawPerformanceData.consistency_score)
    };

    // Generate insights using Gemini API
    const insights = await generateWorkoutInsights(performanceData);

    // Return the insights
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error in insights API:", error);
    
    // Return fallback response on error
    return NextResponse.json({
      insights: [
        "Great job completing your yoga session!",
        "Your performance shows dedication to your practice."
      ],
      recommendations: [
        "Continue practicing regularly to improve your form",
        "Focus on breathing and mindfulness during poses"
      ],
      encouragement: "Keep up the excellent work! Every practice session helps you grow stronger."
    });
  }
} 
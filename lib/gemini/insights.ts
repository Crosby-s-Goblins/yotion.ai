import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export interface PerformanceData {
  duration_s: number;
  accuracy_score: number;
  consistency_score: number;
  exercises_performed: string[];
  date: string;
}

export interface InsightResponse {
  insights: string[];
  recommendations: string[];
  encouragement: string;
}

export async function generateWorkoutInsights(
  performanceData: PerformanceData
): Promise<InsightResponse> {
  try {
    // Create a prompt based on the performance data
    const prompt = `
You are a supportive yoga AI coach analyzing a user's workout performance. Based on the following data, provide personalized insights, recommendations, and encouragement.

Performance Data:
- Duration: ${performanceData.duration_s} seconds (${Math.floor(performanceData.duration_s / 60)} minutes ${performanceData.duration_s % 60} seconds)
- Accuracy Score: ${performanceData.accuracy_score}% (0-100 scale, where 100% is perfect form)
- Consistency Score: ${performanceData.consistency_score}% (0-100 scale, where 100% is perfect stability)
- Different Yoga Poses Practiced: ${performanceData.exercises_performed.join(", ")}
- Total Number of Different Poses: ${performanceData.exercises_performed.length}

IMPORTANT DATA CLARIFICATION:
- Each item in the "Different Yoga Poses Practiced" list represents a DIFFERENT yoga pose that was performed during this session
- The user performed ${performanceData.exercises_performed.length} DIFFERENT poses, not multiple repetitions of the same pose
- This was a session with ${performanceData.exercises_performed.length} unique/different yoga poses
- Do NOT assume this means multiple instances of the same pose - these are different poses

Note: 
- All scores are on a 0-100 percentage scale. Higher scores indicate better performance.
- Focus on the variety of poses (${performanceData.exercises_performed.length} different poses) and the quality metrics (accuracy and consistency scores).

Please provide your response in the following JSON format:
{
  "insights": [
    "2 specific insights about their performance",
    "Focus on what the scores indicate about their practice. Be objective, a high score is good and a low score needs improvement."
  ],
  "recommendations": [
    "2 actionable recommendations for improvement",
    "Specific poses or techniques to work on"
  ],
  "encouragement": "A warm, encouraging message about their progress and practice"
}

Keep the tone conversational, supportive, and focused on yoga practice improvement. Be specific about what their scores mean and provide practical next steps.
`;

    // Generate content using the new API with thinking disabled
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking
        },
      },
    });

    const text = result.text || "";

    // Parse the JSON response - handle markdown code blocks
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Clean up any remaining formatting
    jsonText = jsonText.trim();
    
    const parsedResponse: InsightResponse = JSON.parse(jsonText);

    return parsedResponse;
  } catch (error) {
    console.error("Error generating insights:", error);
    
    // Log the raw response for debugging if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      console.error("Failed to parse AI response. This might help debug:", error.message);
    }
    
    // Return fallback insights if API fails
    return {
      insights: [
        "Great job completing your yoga session!",
        "Your consistency and accuracy scores show dedication to your practice."
      ],
      recommendations: [
        "Continue practicing regularly to build strength and flexibility",
        "Focus on breathing and mindfulness during poses"
      ],
      encouragement: "Keep up the excellent work! Every practice session brings you closer to your goals."
    };
  }
}

// Helper function to validate API key
export function validateGeminiSetup(): boolean {
  return !!process.env.GEMINI_API_KEY;
} 
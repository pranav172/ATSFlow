import type { ATSScore } from './ats-scorer';

export interface AIAnalysisResult {
  suggestedScore: number;
  detectedKeywords: string[];
  missingKeywords: string[];
  sectionIssues: string[];
  strengths: string[];
  improvements: Array<{
    category: string;
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  breakdown?: any; // Detailed breakdown from ATS scorer
  grade?: 'Excellent' | 'Good' | 'Fair' | 'Poor'; // Overall grade
}

/**
 * Analyze resume using Google Gemini
 */
export async function analyzeWithGemini(
  resumeText: string,
  atsScore: ATSScore
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer.

Analyze this resume and provide a detailed assessment. The current rule-based score is ${atsScore.totalScore}/100.

Resume Text:
${resumeText}

Provide your analysis in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "suggestedScore": <number 0-100>,
  "detectedKeywords": [<array of technical skills and keywords found>],
  "missingKeywords": [<array of common industry keywords that are missing>],
  "sectionIssues": [<array of section-specific problems>],
  "strengths": [<array of 3-5 strong points>]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Return with empty improvements (will be filled by Groq)
    return {
      ...analysis,
      improvements: [],
    };
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    // Return fallback analysis
    return {
      suggestedScore: atsScore.totalScore,
      detectedKeywords: [],
      missingKeywords: [],
      sectionIssues: [],
      strengths: ['Resume successfully parsed'],
      improvements: [],
    };
  }
}

/**
 * Generate optimization suggestions using Groq
 */
export async function generateOptimizationsWithGroq(
  resumeText: string,
  atsScore: ATSScore,
  geminiAnalysis: AIAnalysisResult
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not configured, skipping optimizations');
    return geminiAnalysis;
  }

  const prompt = `You are an expert resume optimization coach.

Given this resume with an ATS score of ${atsScore.totalScore}/100, provide 5-10 specific, actionable improvements.

Current Issues:
${Object.values(atsScore.breakdown)
  .flatMap((cat) => cat.issues)
  .map((issue, i) => `${i + 1}. ${issue}`)
  .join('\n')}

Resume Summary:
${resumeText.slice(0, 1000)}...

Provide improvements in the following JSON format (respond with ONLY valid JSON):
{
  "improvements": [
    {
      "category": "keywords|formatting|content|structure",
      "issue": "<specific problem>",
      "suggestion": "<actionable fix>",
      "priority": "high|medium|low"
    }
  ]
}

Focus on the most impactful changes. Be specific and actionable.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Updated model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      throw new Error(`Groq API failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('No response from Groq');
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Groq');
    }

    const optimizations = JSON.parse(jsonMatch[0]);

    return {
      ...geminiAnalysis,
      improvements: optimizations.improvements || [],
    };
  } catch (error) {
    console.error('Groq optimization failed:', error);
    // Return analysis without Groq improvements
    return geminiAnalysis;
  }
}

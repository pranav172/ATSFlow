'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@clerk/nextjs/server';
import { aiService } from '@/lib/ai/analysis-service';

const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

// Helper to ensure authenticated
async function checkAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  if (!apiKey) throw new Error('AI API Key missing');
  return userId;
}

export async function optimizeSection(originalText: string, instruction: string, context?: string) {
  try {
     // Use Hybrid Service - defaults to Groq if key exists, falls back to Gemini
     const rewrittenText = await aiService.optimizeText(originalText, instruction, 'groq', context);
     return { success: true, text: rewrittenText.trim() };
  } catch (error) {
    console.error("Optimize Error:", error);
    return { success: false, error: 'Failed to generate optimization' };
  }
}

export async function tailorResumeToJob(resumeText: string, jobDescription: string) {
  await checkAuth();

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17", generationConfig: { responseMimeType: "application/json" } });

  const prompt = `
    You are an expert Career Coach and ATS specialist.
    Analyze the Candidate's Resume against the Job Description (JD).
    
    Job Description:
    """
    ${jobDescription}
    """
    
    Resume Text (Excerpt):
    """
    ${resumeText.slice(0, 5000)} 
    """
    
    Provide a JSON response with:
    1. "tailoredSummary": A new 3-4 sentence professional summary tailored specifically to this JD.
    2. "missingKeywords": A list of 5-10 important technical keywords or skills from the JD that are missing or weak in the resume.
    3. "matchScore": CRITICAL - Calculate a number from 0-100 indicating how well the current resume matches the JD. Count matching keywords and skills to determine this score. If the resume has most required skills, score 70+. If few match, score below 40. NEVER return 0 unless absolutely nothing matches.
    4. "skillGaps": A list of specific skills or technologies in the JD that appear completely missing from the candidate's background.
    5. "suggestedRewrites": A list of 2-3 specific bullet points from the resume that could be rewritten to better align with the JD's requirements.
    
    IMPORTANT for matchScore:
    - Count the number of required skills mentioned in the JD
    - Count how many of those are present in the resume (even partially)
    - matchScore = (matched_skills / total_required_skills) * 100
    - Round to nearest integer
    - Must be a NUMBER, not a string
    
    IMPORTANT for suggestedRewrites:
    - The "rewritten" version MUST be concise, bullet-point style, and impact-driven.
    - Do NOT use fluffy language. Use strong action verbs.
    - Avoid filler words like "Demonstrated ability to", "Responsible for", etc. Start directly with the verb.
    - Keep it under 2 lines if possible.
    
    Output JSON format (matchScore MUST be a number, not a string):
    {
      "tailoredSummary": "string",
      "missingKeywords": ["string", "string"],
      "matchScore": 75,
      "skillGaps": ["string", "string"],
      "suggestedRewrites": [
        { "original": "Created an API", "rewritten": "Designed high-performance REST API using FastAPI, supporting microservices architecture." }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw AI Response:", text);
    
    const parsed = JSON.parse(text);
    
    // Ensure matchScore is a number and not 0 if we have data
    let matchScore = parsed.matchScore;
    
    // If matchScore came as string, parse it
    if (typeof matchScore === 'string') {
      matchScore = parseInt(matchScore, 10) || 0;
    }
    
    // If matchScore is still 0 but we have keywords, estimate based on missing vs total
    if (matchScore === 0 && parsed.missingKeywords && parsed.missingKeywords.length > 0) {
      // Estimate: if we found missing keywords, there must be some match
      // A very rough heuristic - assume 10 keywords expected, subtract missing
      const estimatedTotal = 15;
      const missing = parsed.missingKeywords.length;
      matchScore = Math.max(10, Math.round(((estimatedTotal - missing) / estimatedTotal) * 100));
      console.log(`matchScore was 0, estimated to ${matchScore} based on ${missing} missing keywords`);
    }
    
    return {
      ...parsed,
      matchScore: matchScore || 0
    };
  } catch (error) {
    console.error("Tailor Error:", error);
    throw new Error('Failed to tailor resume');
  }
}


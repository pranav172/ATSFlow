import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateATSScore } from './ats-scorer';
import { analyzeWithGemini, generateOptimizationsWithGroq } from './ai-provider';
import type { AIAnalysisResult } from './ai-provider';

export interface AnalyzeResumeResult {
  atsScore: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  analysis: AIAnalysisResult;
}

/**
 * Main function to analyze a resume and generate AI insights
 */
export async function analyzeResume(
  resumeId: string,
  userId: string
): Promise<AnalyzeResumeResult> {
  // 1. Fetch resume from database
  const resume = await db.query.resumes.findFirst({
    where: eq(resumes.id, resumeId),
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  if (resume.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (!resume.rawText || !resume.structuredContent) {
    throw new Error('Resume not parsed yet');
  }

  // 2. Calculate rule-based ATS score
  const startTime = Date.now();
  const atsScore = calculateATSScore(
    resume.rawText,
    resume.structuredContent as any
  );

  console.log(`Rule-based ATS Score: ${atsScore.totalScore}/100 (${atsScore.grade})`);

  // 3. Analyze with Gemini
  let analysis: AIAnalysisResult;
  let geminiTokens = { prompt: 0, completion: 0, total: 0 };
  let groqTokens = { prompt: 0, completion: 0, total: 0 };

  try {
    analysis = await analyzeWithGemini(resume.rawText, atsScore);
    
    // Estimate tokens (rough calculation)
    geminiTokens.prompt = Math.ceil(resume.rawText.length / 4);
    geminiTokens.completion = 256; // Approximate
    geminiTokens.total = geminiTokens.prompt + geminiTokens.completion;

    console.log('Gemini analysis complete');
  } catch (error) {
    console.error('Gemini failed, using fallback:', error);
    analysis = {
      suggestedScore: atsScore.totalScore,
      detectedKeywords: [],
      missingKeywords: [],
      sectionIssues: [],
      strengths: ['Resume successfully analyzed'],
      improvements: [],
    };
  }

  // 4. Generate optimizations with Groq
  try {
    analysis = await generateOptimizationsWithGroq(
      resume.rawText,
      atsScore,
      analysis
    );

    groqTokens.prompt = Math.ceil(resume.rawText.length / 4);
    groqTokens.completion = 512; // Approximate
    groqTokens.total = groqTokens.prompt + groqTokens.completion;

    console.log(`Groq optimizations: ${analysis.improvements.length} suggestions`);
  } catch (error) {
    console.error('Groq failed, proceeding without optimizations:', error);
    // Continue with basic analysis
  }



  // 5. Calculate final score
  // If AI provided a suggestion, blend it (70% rule-based, 30% AI)
  // Otherwise, use 100% rule-based score
  let finalScore: number;
  if (analysis.suggestedScore > 0 && analysis.suggestedScore !== atsScore.totalScore) {
    finalScore = Math.round(atsScore.totalScore * 0.7 + analysis.suggestedScore * 0.3);
  } else {
    finalScore = atsScore.totalScore;
  }

  console.log(`Final ATS Score: ${finalScore}/100 (Rule-based: ${atsScore.totalScore}, AI: ${analysis.suggestedScore || 'N/A'})`);

  // 6. Update resume with analysis results
  await db
    .update(resumes)
    .set({
      atsScore: finalScore,
      atsAnalysis: {
        score: finalScore,
        grade: atsScore.grade,
        breakdown: atsScore.breakdown,
        aiAnalysis: analysis,
        analyzedAt: new Date().toISOString(),
      },
    })
    .where(eq(resumes.id, resumeId));

  // TODO: Re-enable optimization logging after fixing schema types

  return {
    atsScore: finalScore,
    grade: atsScore.grade,
    analysis: {
      ...analysis,
      breakdown: atsScore.breakdown, // Include detailed breakdown for UI
      grade: atsScore.grade,
    },
  };
}

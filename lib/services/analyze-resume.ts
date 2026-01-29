import { db } from '@/lib/db';
import { resumes, optimizationLogs } from '@/lib/db/schema';
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
  }

  const latencyMs = Date.now() - startTime;

  // 5. Calculate final score (blend rule-based + AI suggestion)
  const finalScore = Math.round((atsScore.totalScore + analysis.suggestedScore) / 2);

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
      status: 'analyzed',
    })
    .where(eq(resumes.id, resumeId));

  // 7. Log to optimization_logs for observability
  try {
    await db.insert(optimizationLogs).values({
      resumeId,
      userId,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      promptTokens: geminiTokens.prompt,
      completionTokens: geminiTokens.completion,
      totalTokens: geminiTokens.total,
      costUsd: (geminiTokens.total / 1_000_000) * 0.075, // Gemini pricing
      latencyMs,
      success: true,
    });

    if (groqTokens.total > 0) {
      await db.insert(optimizationLogs).values({
        resumeId,
        userId,
        provider: 'groq',
        model: 'llama-3.1-70b',
        promptTokens: groqTokens.prompt,
        completionTokens: groqTokens.completion,
        totalTokens: groqTokens.total,
        costUsd: 0, // Groq is free
        latencyMs,
        success: true,
      });
    }
  } catch (logError) {
    console.error('Failed to log optimization:', logError);
    // Don't fail the request if logging fails
  }

  return {
    atsScore: finalScore,
    grade: atsScore.grade,
    analysis,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseLatexContent } from '@/lib/services/latex-parser';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(userId, RATE_LIMITS.analyze);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { latexContent, jobDescription } = await req.json();

    if (!latexContent || latexContent.length < 100) {
      return NextResponse.json({ error: 'Invalid LaTeX content' }, { status: 400 });
    }

    // Parse LaTeX to extract readable text
    const parsed = parseLatexContent(latexContent);

    // Generate ATS improvement suggestions using AI
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-preview-04-17',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are an expert ATS (Applicant Tracking System) consultant.

Analyze this resume (extracted from LaTeX) and suggest MINIMAL, SPECIFIC improvements to make it more ATS-friendly.

Resume Text:
"""
${parsed.fullText.slice(0, 6000)}
"""

${jobDescription ? `Target Job Description:
"""
${jobDescription.slice(0, 2000)}
"""` : ''}

IMPORTANT RULES:
1. DO NOT add new skills or experience the candidate doesn't have
2. Only suggest MINOR keyword adjustments and formatting tweaks
3. Keep changes minimal - just improve what's already there
4. Focus on: action verbs, quantifiable metrics, keyword alignment
5. Maximum 5 suggestions, each very specific

Return JSON:
{
  "suggestions": [
    {
      "type": "keyword" | "formatting" | "content",
      "priority": "high" | "medium" | "low",
      "original": "exact text to find in resume",
      "improved": "the improved version",
      "reason": "brief explanation (1 sentence)"
    }
  ],
  "overallScore": 0-100,
  "summary": "1-2 sentence summary of key improvements"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const analysis = JSON.parse(text);

    return NextResponse.json({
      success: true,
      originalText: parsed.fullText,
      sections: parsed.sections.map(s => s.name).filter(Boolean),
      ...analysis
    });

  } catch (error) {
    console.error('LaTeX analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze LaTeX resume' }, { status: 500 });
  }
}

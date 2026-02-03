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
      return NextResponse.json({ error: 'Invalid LaTeX content. Please paste at least 100 characters.' }, { status: 400 });
    }

    // Check API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not configured');
      return NextResponse.json({ error: 'AI service not configured. Please contact support.' }, { status: 500 });
    }

    // Parse LaTeX to extract readable text
    const parsed = parseLatexContent(latexContent);

    // Generate ATS improvement suggestions using AI
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
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
    
    // Try to parse JSON - the AI might return markdown-wrapped JSON
    let analysis;
    try {
      // Try direct parse first
      analysis = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find JSON object directly
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          analysis = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }
    }

    return NextResponse.json({
      success: true,
      originalText: parsed.fullText,
      sections: parsed.sections.map(s => s.name).filter(Boolean),
      ...analysis
    });

  } catch (error) {
    console.error('LaTeX analysis error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ error: 'AI service configuration error. Please contact support.' }, { status: 500 });
      }
      if (error.message.includes('parse') || error.message.includes('JSON')) {
        return NextResponse.json({ error: 'Failed to process AI response. Please try again.' }, { status: 500 });
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json({ error: 'AI service rate limit reached. Please try again later.' }, { status: 429 });
      }
      // Log the actual error for debugging
      console.error('Detailed error:', error.message);
    }
    
    return NextResponse.json({ error: 'Failed to analyze LaTeX resume. Please try again.' }, { status: 500 });
  }
}

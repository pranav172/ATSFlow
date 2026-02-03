import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = checkRateLimit(userId, RATE_LIMITS.ai);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: 'Resume text is required (min 50 characters)' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are an expert interview coach. Generate interview questions based on the candidate's resume${jobDescription ? ' and the target job description' : ''}.

Resume:
"""${resumeText.slice(0, 5000)}"""

${jobDescription ? `Job Description:\n"""${jobDescription.slice(0, 2000)}"""` : ''}

Generate 8-10 interview questions that:
1. Test the candidate's experience and skills mentioned in their resume
2. Include behavioral, technical, and situational questions
3. Are relevant to the job if JD is provided

Return JSON:
{
  "questions": [
    {
      "question": "The interview question",
      "type": "behavioral" | "technical" | "situational",
      "tip": "Brief tip on how to answer this question well",
      "sampleAnswer": "A sample strong answer based on the resume (1-2 sentences)"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse response');
      }
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Interview prep error:', error);
    return NextResponse.json({ error: 'Failed to generate interview questions' }, { status: 500 });
  }
}

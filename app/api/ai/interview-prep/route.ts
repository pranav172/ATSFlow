import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateInterviewQuestions } from '@/lib/ai/ai-router';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(userId, RATE_LIMITS.ai);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { jobDescription, resumeContext } = await req.json();

    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json({ error: 'Job description too short' }, { status: 400 });
    }

    const questions = await generateInterviewQuestions(jobDescription, resumeContext);

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Interview prep API error:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}

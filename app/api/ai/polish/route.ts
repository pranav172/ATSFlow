import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { quickPolish } from '@/lib/ai/ai-router';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(userId, RATE_LIMITS.aiOperations);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { text } = await req.json();

    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'Text too short' }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'Text too long (max 1000 chars)' }, { status: 400 });
    }

    const polished = await quickPolish(text);

    return NextResponse.json({ polished });

  } catch (error) {
    console.error('Polish API error:', error);
    return NextResponse.json({ error: 'Failed to polish text' }, { status: 500 });
  }
}

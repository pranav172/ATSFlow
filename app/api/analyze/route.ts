import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/services/user-sync';
import { analyzeResume } from '@/lib/services/analyze-resume';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Missing resumeId', code: 'MISSING_RESUME_ID' },
        { status: 400 }
      );
    }

    // TEMPORARILY DISABLED FOR TESTING - Unlimited analyses
    // 3. Check user credits (free users get 1 free analysis)
    // if ((user.creditsRemaining ?? 0) <= 0 && user.subscriptionTier === 'free') {
    //   return NextResponse.json(
    //     {
    //       error: 'No credits remaining. Upgrade to Pro for unlimited analyses.',
    //       code: 'NO_CREDITS',
    //     },
    //     { status: 403 }
    //   );
    // }

    // 4. Run AI analysis
    console.log(`Analyzing resume ${resumeId} for user ${user.id}`);
    const result = await analyzeResume(resumeId, user.id);

    // TEMPORARILY DISABLED FOR TESTING - No credit deduction
    // 5. Deduct credit if free tier
    // if (user.subscriptionTier === 'free') {
    //   await db
    //     .update(users)
    //     .set({
    //       creditsRemaining: Math.max(0, (user.creditsRemaining ?? 0) - 1),
    //     })
    //     .where(eq(users.id, user.id));
    // }

    // 6. Return analysis results
    return NextResponse.json({
      success: true,
      atsScore: result.atsScore,
      grade: result.grade,
      analysis: result.analysis,
      creditsRemaining: 'unlimited', // Testing mode - unlimited credits
    });
  } catch (error: any) {
    console.error('Analyze API error:', error);

    // Handle specific errors
    if (error.message === 'Resume not found') {
      return NextResponse.json(
        { error: 'Resume not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authorized to analyze this resume', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    if (error.message === 'Resume not parsed yet') {
      return NextResponse.json(
        { error: 'Resume must be parsed before analysis', code: 'NOT_PARSED' },
        { status: 400 }
      );
    }

    // Rate limit errors from AI providers
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'AI service temporarily unavailable. Please try again in a minute.',
          code: 'RATE_LIMIT',
        },
        { status: 429 }
      );
    }

    // Generic AI errors
    if (error.message.includes('API') || error.message.includes('Gemini') || error.message.includes('Groq')) {
      return NextResponse.json(
        {
          error: 'AI analysis failed. Please try again.',
          code: 'AI_ERROR',
        },
        { status: 500 }
      );
    }

    // Unknown error
    return NextResponse.json(
      { error: 'Analysis failed. Please try again later.', code: 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { resumes, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { matchResumeToJD, getQuickMatchScore } from '@/lib/services/jd-matcher';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(userId, RATE_LIMITS.match);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Resolve Clerk ID to Internal DB ID
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json({ 
        error: 'User account not found. Please log out and back in.' 
      }, { status: 404 });
    }

    const body = await req.json();
    const { resumeId, jobDescription, quickMatch } = body;

    if (!resumeId || !jobDescription) {
      return NextResponse.json({ 
        error: 'Missing required fields: resumeId and jobDescription' 
      }, { status: 400 });
    }

    if (jobDescription.length < 50) {
      return NextResponse.json({ 
        error: 'Job description too short. Please paste the full job posting.' 
      }, { status: 400 });
    }

    // Fetch resume
    const resume = await db.query.resumes.findFirst({
      where: eq(resumes.id, resumeId),
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (resume.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!resume.rawText) {
      return NextResponse.json({ 
        error: 'Resume text not available. Please re-upload.' 
      }, { status: 400 });
    }

    // Quick match just returns a score
    if (quickMatch) {
      const score = getQuickMatchScore(resume.rawText, jobDescription);
      return NextResponse.json({ score });
    }

    // Full match analysis
    const matchResult = matchResumeToJD(resume.rawText, jobDescription);

    return NextResponse.json({
      success: true,
      ...matchResult,
    });

  } catch (error) {
    console.error('JD Match API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

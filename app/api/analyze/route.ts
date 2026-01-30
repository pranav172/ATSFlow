import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { resumes, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { analyzeResume } from '@/lib/ai/analysis-service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve Clerk ID to Internal DB ID
    
    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const internalUserId = dbUser.id;

    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // 1. Fetch Resume
    const [resume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, internalUserId)))
      .limit(1);

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.rawText) {
      return NextResponse.json({ error: 'Resume has no text content to analyze' }, { status: 400 });
    }

    // 2. Analyze with AI
    // Update status to 'analyzing'
    await db.update(resumes)
      .set({ status: 'analyzing' })
      .where(eq(resumes.id, resumeId));

    try {
      const analysisCheck = await analyzeResume(resume.rawText);

      // 3. Save Results
      await db.update(resumes)
        .set({
          atsScore: analysisCheck.score,
          atsAnalysis: analysisCheck,
          status: 'analyzed'
        })
        .where(eq(resumes.id, resumeId));

      return NextResponse.json(analysisCheck);

    } catch (aiError) {
      console.error("AI Analysis Failed Detailed:", aiError);
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI Error';
      
      // Revert status on failure
      await db.update(resumes)
        .set({ status: 'failed', errorMessage: `AI Analysis Failed: ${errorMessage}` })
        .where(eq(resumes.id, resumeId));
        
      return NextResponse.json({ error: `AI Analysis Failed: ${errorMessage}` }, { status: 500 });
    }

  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const { resumeText, jobDescription, companyName } = await req.json();

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: 'Resume text is required (min 50 characters)' }, { status: 400 });
    }

    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json({ error: 'Job description is required (min 50 characters)' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert cover letter writer. Write a professional, compelling cover letter for a job application.

Candidate's Resume:
"""${resumeText.slice(0, 4000)}"""

Job Description:
"""${jobDescription.slice(0, 2000)}"""

${companyName ? `Company: ${companyName}` : ''}

Write a cover letter that:
1. Opens with a strong hook that shows enthusiasm for the role
2. Highlights 2-3 most relevant experiences from the resume that match the job requirements
3. Demonstrates understanding of the company/role
4. Uses specific achievements and metrics where available
5. Ends with a confident call to action

Format:
- Professional but personable tone
- 3-4 paragraphs
- About 250-350 words
- Do NOT include placeholders like [Your Name] - write it as if ready to send

Return ONLY the cover letter text, no additional formatting or explanation.`;

    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text().trim();

    return NextResponse.json({ coverLetter });

  } catch (error) {
    console.error('Cover letter error:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}

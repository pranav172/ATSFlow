import { getOrCreateUser } from '@/lib/services/user-sync';
import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Generate comprehensive AI-powered report for a resume
 * Includes: job predictions, project analysis, skill gaps, career insights
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Fetch resume
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id));

    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const structured = resume.structuredContent as any;
    const resumeText = resume.rawText;

    if (!resumeText || !structured) {
      return NextResponse.json({ error: 'Resume not fully parsed' }, { status: 400 });
    }

    // Generate comprehensive insights
    const report = await generateComprehensiveReport(resumeText, structured);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

/**
 * Generate all AI-powered insights for the report
 */
async function generateComprehensiveReport(resumeText: string, structured: any) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  // Prepare resume summary for AI
  const resumeSummary = `
Resume Summary:
- Skills: ${structured.skills.slice(0, 15).join(', ')}
- Experience: ${structured.experience?.length || 0} positions
- Education: ${structured.education?.length || 0} degrees
- Projects: ${resumeText.match(/project/gi)?.length || 0} mentioned
  `.trim();

  // Combined prompt for all insights
  const prompt = `You are an expert career coach and resume analyzer. Analyze this resume comprehensively.

${resumeSummary}

Full Resume Text:
${resumeText.slice(0, 3000)}...

Provide a COMPLETE analysis in the following JSON format (respond with ONLY valid JSON):
{
  "jobPredictions": {
    "roles": [
      {
        "title": "Job title exactly matching this candidate",
        "confidence": 85,
        "companies": ["Company type 1", "Company type 2", "Company type 3"],
        "reasoning": "Why this role fits based on specific skills/experience"
      }
    ],
    "experienceLevel": "Junior|Mid-level|Senior|Lead",
    "industries": ["Tech", "Finance", etc]
  },
  "projectImpact": [
    {
      "projectName": "Extracted from resume",
      "complexity": 7,
      "impact": "Business impact description",
      "technologies": ["Tech1", "Tech2"],
      "suggestions": ["How to better highlight this project"]
    }
  ],
  "skillGaps": {
    "present": ["Skill1", "Skill2", ...],
    "missing": ["Skill that would help"],
    "recommended": [
      {
        "skill": "TypeScript",
        "priority": "high",
        "reason": "Commonly required in target roles"
      }
    ]
  },
  "careerInsights": {
    "nextStep": "Logical next career move",
    "timeline": "Realistic timeframe",
    "recommendations": [
      "Specific action item 1",
      "Specific action item 2"
    ]
  }
}

Be SPECIFIC and ACTIONABLE. Use actual data from the resume.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const insights = JSON.parse(jsonMatch[0]);

    return insights;
  } catch (error) {
    console.error('AI generation failed:', error);
    
    // Return fallback data
    return {
      jobPredictions: {
        roles: [
          {
            title: 'Software Engineer',
            confidence: 75,
            companies: ['Tech Startups', 'Mid-size Companies'],
            reasoning: 'Based on technical skills shown in resume',
          },
        ],
        experienceLevel: structured.experience?.length >= 3 ? 'Mid-level' : 'Junior',
        industries: ['Technology', 'Software'],
      },
      projectImpact: [],
      skillGaps: {
        present: structured.skills.slice(0, 10),
        missing: [],
        recommended: [
          {
            skill: 'Cloud Technologies',
            priority: 'high',
            reason: 'Increasingly required in modern tech roles',
          },
        ],
      },
      careerInsights: {
        nextStep: 'Continue developing technical skills',
        timeline: '6-12 months',
        recommendations: [
          'Build portfolio projects',
          'Contribute to open source',
          'Network with industry professionals',
        ],
      },
    };
  }
}

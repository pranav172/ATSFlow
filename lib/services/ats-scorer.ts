import type { StructuredResume } from './parse-resume';

export interface ATSScoreBreakdown {
  contact: { score: number; max: number; issues: string[] };
  keywords: { score: number; max: number; issues: string[] };
  sections: { score: number; max: number; issues: string[] };
  formatting: { score: number; max: number; issues: string[] };
  atsCompatibility: { score: number; max: number; issues: string[] };
}

export interface ATSScore {
  totalScore: number;
  breakdown: ATSScoreBreakdown;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

/**
 * Calculate ATS score based on rule-based analysis
 * Score ranges: 0-100
 * - 80-100: Excellent (ATS-optimized)
 * - 60-79: Good (Minor improvements needed)
 * - 40-59: Fair (Significant improvements needed)
 * - 0-39: Poor (Major rewrite needed)
 */
export function calculateATSScore(
  resumeText: string,
  structured: StructuredResume
): ATSScore {
  const breakdown: ATSScoreBreakdown = {
    contact: scoreContactInfo(structured),
    keywords: scoreKeywords(resumeText, structured),
    sections: scoreSectionCompleteness(structured),
    formatting: scoreFormatting(resumeText, structured),
    atsCompatibility: scoreATSCompatibility(resumeText),
  };

  const totalScore = Math.round(
    breakdown.contact.score +
      breakdown.keywords.score +
      breakdown.sections.score +
      breakdown.formatting.score +
      breakdown.atsCompatibility.score
  );

  const grade =
    totalScore >= 80
      ? 'Excellent'
      : totalScore >= 60
      ? 'Good'
      : totalScore >= 40
      ? 'Fair'
      : 'Poor';

  return { totalScore, breakdown, grade };
}

/**
 * Score contact information completeness (15 points max)
 */
function scoreContactInfo(structured: StructuredResume) {
  const issues: string[] = [];
  let score = 0;

  // Email (5 pts)
  if (structured.contact.email) {
    score += 5;
  } else {
    issues.push('Missing email address');
  }

  // Phone (5 pts)
  if (structured.contact.phone) {
    score += 5;
  } else {
    issues.push('Missing phone number');
  }

  // LinkedIn or GitHub (5 pts)
  if (structured.contact.linkedin || structured.contact.github) {
    score += 5;
  } else {
    issues.push('Add LinkedIn or GitHub profile');
  }

  return { score, max: 15, issues };
}

/**
 * Score keyword usage and technical skills (30 points max)
 */
function scoreKeywords(resumeText: string, structured: StructuredResume) {
  const issues: string[] = [];
  let score = 0;

  // Technical skills count (15 pts)
  const skillCount = structured.skills.length;
  if (skillCount >= 10) {
    score += 15;
  } else if (skillCount >= 5) {
    score += 10;
    issues.push(`Add ${10 - skillCount} more technical skills`);
  } else {
    score += 5;
    issues.push('Add more technical skills (aim for 10+)');
  }

  // Action verbs (5 pts)
  const actionVerbs = [
    'developed',
    'built',
    'implemented',
    'created',
    'designed',
    'optimized',
    'improved',
    'managed',
    'led',
    'achieved',
  ];
  const verbCount = actionVerbs.filter((verb) =>
    resumeText.toLowerCase().includes(verb)
  ).length;

  if (verbCount >= 5) {
    score += 5;
  } else if (verbCount >= 3) {
    score += 3;
    issues.push('Use more action verbs (developed, implemented, optimized)');
  } else {
    score += 1;
    issues.push('Use strong action verbs to start bullet points');
  }

  // Quantifiable achievements (10 pts)
  const hasNumbers = /\d+(\.\d+)?%|\d+\+|\d+x/g.test(resumeText);
  if (hasNumbers) {
    score += 10;
  } else {
    issues.push('Add quantifiable achievements (e.g., "Improved performance by 40%")');
  }

  return { score, max: 30, issues };
}

/**
 * Score section completeness (25 points max)
 */
function scoreSectionCompleteness(structured: StructuredResume) {
  const issues: string[] = [];
  let score = 0;

  // Summary/Objective (5 pts)
  if (structured.summary && structured.summary.length > 50) {
    score += 5;
  } else {
    issues.push('Add a professional summary (2-3 sentences)');
  }

  // Experience section (10 pts)
  if (structured.experience.length > 0) {
    score += 10;
  } else {
    issues.push('Add work experience section');
  }

  // Education section (5 pts)
  if (structured.education.length > 0) {
    score += 5;
  } else {
    issues.push('Add education section');
  }

  // Skills section (5 pts)
  if (structured.skills.length >= 5) {
    score += 5;
  } else {
    issues.push('Add skills section with at least 5 skills');
  }

  return { score, max: 25, issues };
}

/**
 * Score formatting and readability (20 points max)
 */
function scoreFormatting(resumeText: string, structured: StructuredResume) {
  const issues: string[] = [];
  let score = 0;

  // Bullet points usage (5 pts)
  const bulletCount = (resumeText.match(/[•\-\*]\s/g) || []).length;
  if (bulletCount >= 5) {
    score += 5;
  } else if (bulletCount >= 3) {
    score += 3;
    issues.push('Use more bullet points for achievements');
  } else {
    issues.push('Use bullet points instead of paragraphs');
  }

  // Length check (5 pts) - ideal 1-2 pages (~500-1500 words)
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 1500) {
    score += 5;
  } else if (wordCount > 1500) {
    score += 3;
    issues.push('Resume too long - aim for 1-2 pages');
  } else {
    score += 2;
    issues.push('Resume too short - add more details');
  }

  // Consistent formatting (10 pts) - check for common issues
  score += 10; // Assume good by default
  if (resumeText.includes('  ')) {
    score -= 2;
    issues.push('Remove extra spaces');
  }

  return { score, max: 20, issues };
}

/**
 * Score ATS compatibility (10 points max)
 */
function scoreATSCompatibility(resumeText: string) {
  const issues: string[] = [];
  let score = 10; // Start perfect, deduct for issues

  // Check for standard section headers
  const standardHeaders = ['experience', 'education', 'skills'];
  const lowerText = resumeText.toLowerCase();
  
  standardHeaders.forEach((header) => {
    if (!lowerText.includes(header)) {
      score -= 2;
      issues.push(`Use standard header: "${header}"`);
    }
  });

  // Ensure clean text extraction (already done if we got here)
  // This is validated during parsing

  return { score: Math.max(0, score), max: 10, issues };
}

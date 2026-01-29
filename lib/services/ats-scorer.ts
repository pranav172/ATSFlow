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
 * STRICT: Real ATS systems are very picky about contact info
 */
function scoreContactInfo(structured: StructuredResume) {
  const issues: string[] = [];
  let score = 0;

  // Email (5 pts)
  if (structured.contact.email) {
    score += 5;
  } else {
    issues.push('❌ CRITICAL: Missing email address - auto-reject by most ATS');
  }

  // Phone (5 pts)
  if (structured.contact.phone) {
    score += 5;
  } else {
    issues.push('❌ CRITICAL: Missing phone number - auto-reject by most ATS');
  }

  // LinkedIn or GitHub (5 pts) - but must be CLICKABLE links
  if (structured.contact.linkedin || structured.contact.github) {
    // Check if they're actual URLs (not just text like "LinkedIn")
    const hasValidLink = 
      (structured.contact.linkedin?.startsWith('http')) || 
      (structured.contact.github?.startsWith('http'));
    
    if (hasValidLink) {
      score += 5;
    } else {
      score += 2; // Partial credit for having the field
      issues.push('⚠️  LinkedIn/GitHub not clickable URLs - many ATS cannot parse these');
    }
  } else {
    issues.push('⚠️  Add LinkedIn or GitHub profile URL');
  }

  return { score, max: 15, issues };
}

/**
 * Score keyword usage and technical skills (30 points max)
 * STRICT: Top MNCs use keyword matching heavily
 */
function scoreKeywords(resumeText: string, structured: StructuredResume) {
  const issues: string[] = [];
  let score = 0;

  // Technical skills count (15 pts) - MUCH STRICTER
  const skillCount = structured.skills.length;
  if (skillCount >= 15) {
    score += 15;
  } else if (skillCount >= 10) {
    score += 12;
    issues.push(`⚠️  Only ${skillCount} skills detected - top candidates have 15+`);
  } else if (skillCount >= 5) {
    score += 8;
    issues.push(`⚠️  Too few skills (${skillCount}) - add more technical keywords`);
  } else {
    score += 3;
    issues.push('❌ CRITICAL: Very few skills detected - likely auto-rejected');
  }

  // Action verbs (5 pts) - STRICTER
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
    'deployed',
    'architected',
  ];
  const verbCount = actionVerbs.filter((verb) =>
    resumeText.toLowerCase().includes(verb)
  ).length;

  if (verbCount >= 8) {
    score += 5;
  } else if (verbCount >= 5) {
    score += 3;
    issues.push('⚠️  Use more strong action verbs (developed, implemented, optimized)');
  } else {
    score += 1;
    issues.push('❌ Too few action verbs - bullet points seem weak');
  }

  // Quantifiable achievements (10 pts) - MUCH STRICTER
  const numberPatterns = [
    /\d+%/g, // percentages
    /\d+\+/g, // numbers with +
    /\d+x/g, // multipliers
    /\d+k/gi, // thousands
    /\d{1,3}(,\d{3})*/g, // large numbers with commas
  ];
  
  let metricsCount = 0;
  numberPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) metricsCount += matches.length;
  });

  if (metricsCount >= 8) {
    score += 10;
  } else if (metricsCount >= 5) {
    score += 7;
    issues.push(`⚠️  Only ${metricsCount} quantifiable metrics - top resumes have 10+`);
  } else if (metricsCount >= 2) {
    score += 4;
    issues.push(`❌ Only ${metricsCount} metrics found - add numbers to show impact`);
  } else {
    issues.push('❌ CRITICAL: No quantifiable achievements - resume appears generic');
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
 * STRICT: ATS systems prefer specific formatting styles
 */
function scoreFormatting(resumeText: string, _structured: StructuredResume) {
  const issues: string[] = [];
  let score = 0;

  // Bullet points usage (5 pts) - STRICTER
  const bulletCount = (resumeText.match(/[•\-\*]\s/g) || []).length;
  if (bulletCount >= 10) {
    score += 5;
  } else if (bulletCount >= 5) {
    score += 3;
    issues.push(`⚠️  Only ${bulletCount} bullet points - use more (10+ recommended)`);
  } else {
    score += 1;
    issues.push('❌ Too few bullet points - ATS prefers bulleted lists over paragraphs');
  }

  // Length check (5 pts) - ideal 1-2 pages (~400-1200 words)
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount >= 400 && wordCount <= 1200) {
    score += 5;
  } else if (wordCount > 1200) {
    score += 2;
    issues.push(`⚠️  Resume too long (${wordCount} words) - ATS may truncate content`);
  } else {
    score += 2;
    issues.push(`⚠️  Resume too short (${wordCount} words) - add more detail`);
  }

  // LaTeX formatting artifacts (10 pts deduction if found)
  score += 10; // Start with full points
  const latexArtifacts = [
    /\\[a-z]+\{/gi, // LaTeX commands
    /\[.*?\]\(.*?\)/g, // Markdown/LaTeX links  
  ];
  
  let hasLatexIssues = false;
  latexArtifacts.forEach(pattern => {
    if (pattern.test(resumeText)) {
      hasLatexIssues = true;
    }
  });

  if (hasLatexIssues) {
    score -= 5;
    issues.push('❌ CRITICAL: LaTeX formatting detected - most ATS cannot parse this correctly');
  }

  // Check for non-clickable project links like [Live API], [Demo], [Kaggle]
  const hasNonClickableLinks = /\[(Live|Demo|GitHub|Kaggle|Link|Live API)\]/gi.test(resumeText);
  if (hasNonClickableLinks) {
    score -= 3;
    issues.push('❌ Project links not clickable - replace [Demo] with actual URLs');
  }

  return { score: Math.max(0, score), max: 20, issues };
}

/**
 * Score ATS compatibility (10 points max)
 * STRICT: Real ATS systems have specific requirements
 */
function scoreATSCompatibility(resumeText: string) {
  const issues: string[] = [];
  let score = 10; // Start perfect, deduct for issues

  // Check for standard section headers
  const standardHeaders = ['experience', 'education', 'skills'];
  const lowerText = resumeText.toLowerCase();
  
  let missingHeaders = 0;
  standardHeaders.forEach((header) => {
    if (!lowerText.includes(header)) {
      score -= 3;
      missingHeaders++;
      issues.push(`❌ Missing standard "${header}" section header`);
    }
  });

  // Check for problematic formatting that ATS hates
  if (resumeText.includes('|') && resumeText.split('|').length > 5) {
    score -= 2;
    issues.push('⚠️  Excessive use of "|" separator - may confuse ATS parsers');
  }

  // Check for proper spacing
  if (resumeText.includes('  ')) {
    score -= 1;
    issues.push('⚠️  Extra spaces detected - clean up formatting');
  }

  return { score: Math.max(0, score), max: 10, issues };
}

/**
 * Job Description Matching Service
 * 
 * This is THE key feature that makes ATSFlow actually beat ATS systems.
 * Real ATS systems compare resumes AGAINST job descriptions, not just
 * scoring resumes in isolation.
 */

export interface JDMatchResult {
  overallMatchScore: number; // 0-100
  keywordMatchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillGapAnalysis: SkillGap[];
  recommendations: JDRecommendation[];
}

export interface SkillGap {
  skill: string;
  importance: 'required' | 'preferred' | 'nice-to-have';
  mentionCount: number; // How many times mentioned in JD
  suggestion: string;
}

export interface JDRecommendation {
  category: 'keyword' | 'experience' | 'education' | 'certification';
  priority: 'high' | 'medium' | 'low';
  issue: string;
  action: string;
}

// Common tech skill synonyms for semantic matching
const SKILL_SYNONYMS: Record<string, string[]> = {
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2020', 'node.js', 'nodejs'],
  'typescript': ['ts'],
  'python': ['py', 'python3', 'python2'],
  'react': ['reactjs', 'react.js'],
  'angular': ['angularjs', 'angular.js'],
  'vue': ['vuejs', 'vue.js'],
  'node': ['nodejs', 'node.js'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda'],
  'gcp': ['google cloud', 'google cloud platform'],
  'azure': ['microsoft azure'],
  'docker': ['containerization', 'containers'],
  'kubernetes': ['k8s'],
  'machine learning': ['ml', 'deep learning', 'neural networks', 'ai'],
  'artificial intelligence': ['ai', 'machine learning', 'ml'],
  'database': ['db', 'sql', 'nosql'],
  'postgresql': ['postgres', 'psql'],
  'mongodb': ['mongo'],
  'api': ['rest api', 'restful', 'graphql', 'web services', 'endpoints'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'devops'],
  'agile': ['scrum', 'kanban', 'sprint'],
  'git': ['github', 'gitlab', 'bitbucket', 'version control'],
};

// Education keywords
const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'phd', 'degree', 'bs', 'ms', 'ba', 'ma',
  'computer science', 'engineering', 'information technology', 'it',
];

/**
 * Extract keywords from job description text
 */
export function extractJDKeywords(jdText: string): {
  technicalSkills: string[];
  softSkills: string[];
  experienceRequirements: string[];
  educationRequirements: string[];
} {
  const lowerText = jdText.toLowerCase();
  
  const technicalSkills: string[] = [];
  const softSkills: string[] = [];
  const experienceRequirements: string[] = [];
  const educationRequirements: string[] = [];

  // Technical skills - check against synonym map
  Object.keys(SKILL_SYNONYMS).forEach(skill => {
    const allVariants = [skill, ...SKILL_SYNONYMS[skill]];
    if (allVariants.some(variant => lowerText.includes(variant))) {
      if (!technicalSkills.includes(skill)) {
        technicalSkills.push(skill);
      }
    }
  });

  // Common technical keywords not in synonym map
  const techKeywords = [
    'html', 'css', 'sass', 'less', 'webpack', 'vite', 'redux', 'next.js',
    'express', 'django', 'flask', 'spring', 'rails', 'mysql', 'redis',
    'elasticsearch', 'kafka', 'rabbitmq', 'terraform', 'ansible', 'jenkins',
    'linux', 'unix', 'bash', 'shell', 'testing', 'tdd', 'bdd', 'security',
  ];
  
  techKeywords.forEach(keyword => {
    if (lowerText.includes(keyword) && !technicalSkills.includes(keyword)) {
      technicalSkills.push(keyword);
    }
  });

  // Soft skills
  const softSkillKeywords = [
    'communication', 'leadership', 'teamwork', 'problem solving',
    'analytical', 'creative', 'adaptable', 'organized', 'detail-oriented',
    'self-motivated', 'collaborative', 'initiative', 'time management',
  ];
  
  softSkillKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      softSkills.push(keyword);
    }
  });

  // Experience requirements (look for patterns like "3+ years")
  const expPattern = /(\d+)\+?\s*years?\s*(?:of\s+)?(?:experience|exp)/gi;
  const expMatches = lowerText.matchAll(expPattern);
  for (const match of expMatches) {
    experienceRequirements.push(match[0]);
  }

  // Education requirements
  EDUCATION_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      educationRequirements.push(keyword);
    }
  });

  return {
    technicalSkills,
    softSkills,
    experienceRequirements,
    educationRequirements,
  };
}

/**
 * Count keyword occurrences with synonyms
 */
function countKeywordOccurrences(text: string, keyword: string): number {
  const lowerText = text.toLowerCase();
  const variants = [keyword, ...(SKILL_SYNONYMS[keyword] || [])];
  
  let count = 0;
  variants.forEach(variant => {
    const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    count += matches?.length || 0;
  });
  
  return count;
}

/**
 * Main function: Match resume against job description
 */
export function matchResumeToJD(
  resumeText: string,
  jdText: string
): JDMatchResult {
  const jdKeywords = extractJDKeywords(jdText);
  const resumeLower = resumeText.toLowerCase();
  
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const skillGapAnalysis: SkillGap[] = [];

  // Check each technical skill
  jdKeywords.technicalSkills.forEach(skill => {
    const skillVariants = [skill, ...(SKILL_SYNONYMS[skill] || [])];
    const found = skillVariants.some(variant => resumeLower.includes(variant));
    
    if (found) {
      matchedKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
      
      // Analyze the skill gap
      const mentionCount = countKeywordOccurrences(jdText, skill);
      skillGapAnalysis.push({
        skill,
        importance: mentionCount >= 3 ? 'required' : mentionCount >= 2 ? 'preferred' : 'nice-to-have',
        mentionCount,
        suggestion: `Add "${skill}" to your skills section or describe experience using it`,
      });
    }
  });

  // Check soft skills
  jdKeywords.softSkills.forEach(skill => {
    if (resumeLower.includes(skill)) {
      matchedKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  });

  // Calculate match scores
  const totalKeywords = jdKeywords.technicalSkills.length + jdKeywords.softSkills.length;
  const keywordMatchScore = totalKeywords > 0 
    ? Math.round((matchedKeywords.length / totalKeywords) * 100)
    : 0;

  // Generate recommendations
  const recommendations: JDRecommendation[] = [];

  // High priority: Required skills missing
  skillGapAnalysis
    .filter(gap => gap.importance === 'required')
    .slice(0, 3)
    .forEach(gap => {
      recommendations.push({
        category: 'keyword',
        priority: 'high',
        issue: `Missing required skill: ${gap.skill} (mentioned ${gap.mentionCount}x in JD)`,
        action: gap.suggestion,
      });
    });

  // Medium priority: Preferred skills missing
  skillGapAnalysis
    .filter(gap => gap.importance === 'preferred')
    .slice(0, 3)
    .forEach(gap => {
      recommendations.push({
        category: 'keyword',
        priority: 'medium',
        issue: `Missing preferred skill: ${gap.skill}`,
        action: gap.suggestion,
      });
    });

  // Experience match check
  if (jdKeywords.experienceRequirements.length > 0) {
    const hasYearsInResume = /\d+\+?\s*years?/i.test(resumeText);
    if (!hasYearsInResume) {
      recommendations.push({
        category: 'experience',
        priority: 'high',
        issue: 'JD specifies years of experience but your resume lacks quantified experience',
        action: 'Add specific years of experience (e.g., "5+ years of experience in...")',
      });
    }
  }

  // Education match check
  if (jdKeywords.educationRequirements.length > 0) {
    const hasEducation = EDUCATION_KEYWORDS.some(kw => resumeLower.includes(kw));
    if (!hasEducation) {
      recommendations.push({
        category: 'education',
        priority: 'medium',
        issue: 'JD mentions education requirements not found in resume',
        action: 'Ensure your education section includes degree type and field of study',
      });
    }
  }

  // Overall match score (weighted)
  // 70% keyword match, 20% skill coverage, 10% structure
  const overallMatchScore = Math.round(
    keywordMatchScore * 0.7 +
    (skillGapAnalysis.filter(g => g.importance !== 'required').length > 0 ? 20 : 30) +
    (recommendations.filter(r => r.priority === 'high').length === 0 ? 10 : 0)
  );

  return {
    overallMatchScore: Math.min(100, overallMatchScore),
    keywordMatchScore,
    matchedKeywords,
    missingKeywords,
    skillGapAnalysis,
    recommendations,
  };
}

/**
 * Get a quick match score without full analysis
 */
export function getQuickMatchScore(resumeText: string, jdText: string): number {
  const jdKeywords = extractJDKeywords(jdText);
  const resumeLower = resumeText.toLowerCase();
  
  let matches = 0;
  const total = jdKeywords.technicalSkills.length;
  
  jdKeywords.technicalSkills.forEach(skill => {
    const variants = [skill, ...(SKILL_SYNONYMS[skill] || [])];
    if (variants.some(v => resumeLower.includes(v))) {
      matches++;
    }
  });
  
  return total > 0 ? Math.round((matches / total) * 100) : 0;
}

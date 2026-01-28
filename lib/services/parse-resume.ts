import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Types for structured resume content
export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ResumeSection {
  title: string;
  content: string;
}

export interface StructuredResume {
  contact: ResumeContact;
  summary?: string;
  experience: ResumeSection[];
  education: ResumeSection[];
  skills: string[];
  certifications: string[];
  rawSections: Record<string, string>;
}

export interface ParseResult {
  success: boolean;
  rawText?: string;
  structuredContent?: StructuredResume;
  error?: string;
  fileType?: 'pdf' | 'docx';
}

/**
 * Main entry point for parsing resumes
 */
export async function parseResume(file: File): Promise<ParseResult> {
  try {
    const fileType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rawText: string;
    let type: 'pdf' | 'docx';

    // Route to appropriate parser based on file type
    if (fileType === 'application/pdf') {
      rawText = await parsePDF(buffer);
      type = 'pdf';
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      rawText = await parseDOCX(buffer);
      type = 'docx';
    } else {
      return {
        success: false,
        error: 'INVALID_TYPE',
      };
    }

    // Check if we got any text
    if (!rawText || rawText.trim().length < 50) {
      return {
        success: false,
        error: 'NO_TEXT_FOUND',
      };
    }

    // Parse the structured content
    const structuredContent = await structureContent(rawText);

    return {
      success: true,
      rawText,
      structuredContent,
      fileType: type,
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    return {
      success: false,
      error: 'PARSING_FAILED',
    };
  }
}

/**
 * Extract text from PDF file
 */
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

/**
 * Extract text from DOCX file
 */
async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX');
  }
}

/**
 * Extract contact information from resume text
 */
function extractContactInfo(text: string): ResumeContact {
  const contact: ResumeContact = {};

  // Email regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    contact.email = emailMatch[0];
  }

  // Phone regex (supports various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    contact.phone = phoneMatch[0];
  }

  // LinkedIn
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) {
    contact.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
  }

  // GitHub
  const githubRegex = /github\.com\/([a-zA-Z0-9-]+)/i;
  const githubMatch = text.match(githubRegex);
  if (githubMatch) {
    contact.github = `https://github.com/${githubMatch[1]}`;
  }

  // Website (simple URL detection)
  const websiteRegex = /(https?:\/\/[^\s]+)/gi;
  const websiteMatches = text.match(websiteRegex);
  if (websiteMatches) {
    // Filter out LinkedIn and GitHub URLs
    const otherSites = websiteMatches.filter(
      (url) => !url.includes('linkedin.com') && !url.includes('github.com')
    );
    if (otherSites.length > 0) {
      contact.website = otherSites[0];
    }
  }

  // Location (common patterns: City, State or City, Country)
  const locationRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2})/g;
  const locationMatch = text.match(locationRegex);
  if (locationMatch) {
    contact.location = locationMatch[0];
  }

  return contact;
}

/**
 * Extract a specific section from resume text
 */
function extractSection(text: string, keywords: string[]): string {
  const lines = text.split('\n');
  let sectionText = '';
  let capturing = false;
  let captureStartIndex = -1;

  // Common section headers that indicate end of previous section
  const endKeywords = [
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'summary',
    'objective',
    'awards',
    'publications',
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();

    // Check if this line is a section header matching our keywords
    if (keywords.some((keyword) => line.includes(keyword.toLowerCase()))) {
      capturing = true;
      captureStartIndex = i;
      continue;
    }

    // Check if we've hit a different section (stop capturing)
    if (
      capturing &&
      captureStartIndex !== i &&
      endKeywords.some(
        (keyword) =>
          line.includes(keyword) && !keywords.some((k) => line.includes(k.toLowerCase()))
      )
    ) {
      break;
    }

    // Capture lines if we're in the section
    if (capturing && i > captureStartIndex) {
      sectionText += lines[i] + '\n';
    }
  }

  return sectionText.trim();
}

/**
 * Structure the resume content into organized sections
 */
async function structureContent(text: string): Promise<StructuredResume> {
  const contact = extractContactInfo(text);

  // Extract main sections
  const summaryText = extractSection(text, ['summary', 'objective', 'profile', 'about']);
  const experienceText = extractSection(text, [
    'experience',
    'work history',
    'employment',
    'work experience',
  ]);
  const educationText = extractSection(text, [
    'education',
    'academic',
    'qualifications',
  ]);
  const skillsText = extractSection(text, [
    'skills',
    'technical skills',
    'competencies',
    'expertise',
  ]);
  const certificationsText = extractSection(text, [
    'certifications',
    'certificates',
    'licenses',
  ]);

  // Parse skills into array (comma or newline separated)
  const skills = skillsText
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 50); // Filter reasonable skill lengths

  // Parse certifications
  const certifications = certificationsText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Experience and education are more complex - for now just store as sections
  // In a production app, you'd parse job titles, companies, dates, etc.
  const experience: ResumeSection[] = experienceText
    ? [{ title: 'Work Experience', content: experienceText }]
    : [];

  const education: ResumeSection[] = educationText
    ? [{ title: 'Education', content: educationText }]
    : [];

  return {
    contact,
    summary: summaryText || undefined,
    experience,
    education,
    skills,
    certifications,
    rawSections: {
      summary: summaryText,
      experience: experienceText,
      education: educationText,
      skills: skillsText,
      certifications: certificationsText,
    },
  };
}

import { z } from 'zod';

// Schema for the ATS analysis result
export const ResumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall ATS score from 0 to 100"),
  summary: z.string().describe("Executive summary of the resume's quality"),
  
  strengths: z.array(z.string()).describe("List of resume strengths"),
  weaknesses: z.array(z.string()).describe("List of resume weaknesses or areas for improvement"),
  
  hardSkills: z.array(z.string()).describe("List of hard/technical skills extracted"),
  softSkills: z.array(z.string()).describe("List of soft skills extracted"),
  
  formattingIssues: z.array(z.string()).describe("List of formatting issues (e.g., bad fonts, columns, images)"),
  
  missingSections: z.array(z.string()).describe("List of important sections missing from the resume (e.g., Summary, Education)"),
  
  improvementSuggestions: z.array(z.string()).describe("Actionable suggestions to improve the resume"),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

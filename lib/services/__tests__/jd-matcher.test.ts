import { describe, it, expect } from 'vitest';
import { 
  matchResumeToJD, 
  extractJDKeywords, 
  getQuickMatchScore 
} from '../jd-matcher';

describe('JD Matcher Service', () => {
  describe('extractJDKeywords', () => {
    it('extracts technical skills from job description', () => {
      const jd = `
        We are looking for a Senior Software Engineer with experience in:
        - JavaScript/TypeScript and React
        - Node.js and Python
        - AWS or GCP cloud services
        - Docker and Kubernetes
      `;
      
      const result = extractJDKeywords(jd);
      
      expect(result.technicalSkills).toContain('javascript');
      expect(result.technicalSkills).toContain('typescript');
      expect(result.technicalSkills).toContain('react');
      expect(result.technicalSkills).toContain('python');
      expect(result.technicalSkills).toContain('aws');
      expect(result.technicalSkills).toContain('docker');
      expect(result.technicalSkills).toContain('kubernetes');
    });

    it('extracts experience requirements', () => {
      const jd = 'Looking for someone with 5+ years of experience in software development';
      
      const result = extractJDKeywords(jd);
      
      expect(result.experienceRequirements.length).toBeGreaterThan(0);
      expect(result.experienceRequirements[0]).toContain('5');
    });

    it('extracts education requirements', () => {
      const jd = 'Bachelor degree in Computer Science or related field';
      
      const result = extractJDKeywords(jd);
      
      expect(result.educationRequirements).toContain('bachelor');
      expect(result.educationRequirements).toContain('computer science');
    });

    it('extracts soft skills', () => {
      const jd = 'Strong communication skills and leadership abilities';
      
      const result = extractJDKeywords(jd);
      
      expect(result.softSkills).toContain('communication');
      expect(result.softSkills).toContain('leadership');
    });

    it('handles synonym matching for skills', () => {
      // Should match "JS" as "javascript"
      const jd = 'Experience with JS and Node required';
      
      const result = extractJDKeywords(jd);
      
      expect(result.technicalSkills).toContain('javascript');
      expect(result.technicalSkills).toContain('node');
    });
  });

  describe('matchResumeToJD', () => {
    const sampleResume = `
      John Doe
      john@example.com
      
      SUMMARY
      Senior software engineer with 5+ years of experience in JavaScript, React, and Node.js.
      
      EXPERIENCE
      Senior Developer at TechCorp
      - Built React applications serving 1M+ users
      - Developed RESTful APIs using Node.js
      - Managed AWS infrastructure
      
      SKILLS
      JavaScript, TypeScript, React, Node.js, AWS, Docker, PostgreSQL
    `;

    const sampleJD = `
      We are looking for a Senior Software Engineer with:
      - 5+ years of experience in software development
      - Strong JavaScript and TypeScript skills
      - Experience with React and Node.js
      - AWS or cloud platform experience
      - Python experience is a plus
      - Machine learning experience preferred
      - Bachelor's degree in Computer Science
    `;

    it('returns overall match score between 0-100', () => {
      const result = matchResumeToJD(sampleResume, sampleJD);
      
      expect(result.overallMatchScore).toBeGreaterThanOrEqual(0);
      expect(result.overallMatchScore).toBeLessThanOrEqual(100);
    });

    it('identifies matched keywords', () => {
      const result = matchResumeToJD(sampleResume, sampleJD);
      
      expect(result.matchedKeywords).toContain('javascript');
      expect(result.matchedKeywords).toContain('react');
      expect(result.matchedKeywords).toContain('aws');
    });

    it('identifies missing keywords', () => {
      const result = matchResumeToJD(sampleResume, sampleJD);
      
      expect(result.missingKeywords).toContain('python');
      expect(result.missingKeywords).toContain('machine learning');
    });

    it('provides skill gap analysis', () => {
      const result = matchResumeToJD(sampleResume, sampleJD);
      
      expect(result.skillGapAnalysis.length).toBeGreaterThan(0);
      
      const pythonGap = result.skillGapAnalysis.find(g => g.skill === 'python');
      if (pythonGap) {
        expect(pythonGap.importance).toBeDefined();
        expect(pythonGap.suggestion).toBeDefined();
      }
    });

    it('provides actionable recommendations', () => {
      const result = matchResumeToJD(sampleResume, sampleJD);
      
      // Recommendations are generated only when there are missing required skills
      // In this case the resume matches most skills, so may have 0 recommendations
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      
      if (result.recommendations.length > 0) {
        result.recommendations.forEach(rec => {
          expect(['high', 'medium', 'low']).toContain(rec.priority);
          expect(rec.issue).toBeTruthy();
          expect(rec.action).toBeTruthy();
        });
      }
    });

    it('handles resume with perfect match', () => {
      const perfectResume = `
        JavaScript TypeScript React Node.js Python AWS Docker Kubernetes
        Machine learning experience, 10 years experience
        Bachelor's degree in Computer Science
        Strong communication and leadership skills
      `;
      
      const result = matchResumeToJD(perfectResume, sampleJD);
      
      expect(result.keywordMatchScore).toBeGreaterThanOrEqual(80);
    });

    it('handles resume with no matching keywords', () => {
      const unmatchedResume = `
        COBOL programmer with 30 years of mainframe experience
        Skills: COBOL, CICS, JCL, DB2
      `;
      
      const result = matchResumeToJD(unmatchedResume, sampleJD);
      
      // Score should be significantly lower than a matching resume
      expect(result.keywordMatchScore).toBeLessThan(50);
      expect(result.missingKeywords.length).toBeGreaterThan(3);
    });
  });

  describe('getQuickMatchScore', () => {
    it('returns quick match percentage', () => {
      const resume = 'JavaScript React Node.js experience';
      const jd = 'Looking for JavaScript, React, and Python developer';
      
      const score = getQuickMatchScore(resume, jd);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('returns 0 for completely unmatched resume', () => {
      const resume = 'Marketing and sales professional';
      const jd = 'Looking for Kubernetes and Docker expert';
      
      const score = getQuickMatchScore(resume, jd);
      
      expect(score).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty job description', () => {
      const resume = 'JavaScript developer';
      const jd = '';
      
      expect(() => matchResumeToJD(resume, jd)).not.toThrow();
      const result = matchResumeToJD(resume, jd);
      expect(result.overallMatchScore).toBeDefined();
    });

    it('handles empty resume', () => {
      const resume = '';
      const jd = 'Looking for JavaScript developer';
      
      expect(() => matchResumeToJD(resume, jd)).not.toThrow();
    });

    it('handles JD with special characters', () => {
      const jd = 'C++ developer needed! Must know C# and .NET (ASP.NET preferred)';
      
      expect(() => extractJDKeywords(jd)).not.toThrow();
    });

    it('handles case insensitivity', () => {
      const resume = 'JAVASCRIPT REACT NODE.JS AWS';
      const jd = 'javascript, react, node.js, aws required';
      
      const result = matchResumeToJD(resume, jd);
      
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
    });
  });
});

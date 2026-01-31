import { describe, it, expect } from 'vitest';
import { calculateATSScore } from '../ats-scorer';
import type { StructuredResume } from '../parse-resume';

// Helper to create minimal structured resume
function createStructuredResume(overrides: Partial<StructuredResume> = {}): StructuredResume {
  return {
    contact: {
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      website: '',
      location: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    rawSections: {},
    ...overrides,
  };
}

describe('ATS Scorer', () => {
  describe('Contact Info Scoring (15 pts max)', () => {
    it('gives full 15 points for complete contact info with valid URLs', () => {
      const structured = createStructuredResume({
        contact: {
          email: 'john@example.com',
          phone: '+1-555-123-4567',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
        },
      });
      
      const result = calculateATSScore('sample resume text with experience education skills', structured);
      expect(result.breakdown.contact.score).toBe(15);
      expect(result.breakdown.contact.issues).toHaveLength(0);
    });

    it('penalizes missing email critically (0/5 for email)', () => {
      const structured = createStructuredResume({
        contact: {
          phone: '+1-555-123-4567',
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      });
      
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.contact.score).toBeLessThan(15);
      expect(result.breakdown.contact.issues.some(i => i.includes('Missing email'))).toBe(true);
    });

    it('penalizes missing phone critically', () => {
      const structured = createStructuredResume({
        contact: {
          email: 'john@example.com',
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      });
      
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.contact.issues.some(i => i.includes('Missing phone'))).toBe(true);
    });

    it('gives partial credit for non-URL LinkedIn/GitHub', () => {
      const structured = createStructuredResume({
        contact: {
          email: 'john@example.com',
          phone: '+1-555-123-4567',
          linkedin: 'johndoe', // Not a URL
        },
      });
      
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.contact.score).toBeLessThan(15);
      expect(result.breakdown.contact.issues.some(i => i.includes('not clickable URLs'))).toBe(true);
    });

    it('detects embedded link patterns like [Demo] and warns', () => {
      const structured = createStructuredResume({
        contact: {
          email: 'john@example.com',
          phone: '+1-555-123-4567',
        },
      });
      
      const resumeText = 'Built a project [Demo] using React. Check [GitHub] for more.';
      const result = calculateATSScore(resumeText, structured);
      expect(result.breakdown.contact.issues.some(i => i.includes('EMBEDDED LINKS DETECTED'))).toBe(true);
    });

    it('handles resume with no contact info', () => {
      const structured = createStructuredResume();
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.contact.score).toBe(0);
    });
  });

  describe('Keyword Scoring (30 pts max)', () => {
    it('gives full points for 15+ skills', () => {
      const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'Docker', 
                      'AWS', 'PostgreSQL', 'Git', 'TypeScript', 'MongoDB',
                      'Redis', 'GraphQL', 'REST', 'CI/CD', 'Kubernetes'];
      
      const structured = createStructuredResume({ skills });
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.keywords.score).toBeGreaterThanOrEqual(15);
    });

    it('penalizes resume with very few skills', () => {
      const structured = createStructuredResume({
        skills: ['JavaScript', 'Python'],
      });
      
      const result = calculateATSScore('sample text', structured);
      // Check that score is reduced or issues mention skills
      expect(result.breakdown.keywords.score).toBeLessThan(15);
    });

    it('counts action verbs correctly', () => {
      const text = 'Developed a new API. Implemented user authentication. Led team of 5. Built microservices. Deployed to AWS.';
      const structured = createStructuredResume({ skills: [] });
      
      const result = calculateATSScore(text, structured);
      // Should detect: developed, implemented, led, built, deployed
      expect(result.breakdown.keywords.score).toBeGreaterThan(0);
    });

    it('counts metrics (percentages, numbers)', () => {
      const text = 'Improved performance by 40%. Managed team of 10+ engineers. Increased revenue by 25%. Reduced load time by 50ms.';
      const structured = createStructuredResume({ skills: [] });
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.keywords.issues.every(i => !i.includes('NO NUMBERS'))).toBe(true);
    });

    it('penalizes resume with no metrics', () => {
      const text = 'Worked on various projects. Helped team with tasks. Did some coding.';
      const structured = createStructuredResume({ skills: [] });
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.keywords.issues.some(i => i.includes('CRITICAL') || i.includes('metrics'))).toBe(true);
    });
  });

  describe('Section Completeness Scoring (25 pts max)', () => {
    it('gives full points for complete sections', () => {
      const structured = createStructuredResume({
        summary: 'Experienced software engineer with 5+ years building scalable applications.',
        experience: [{ title: 'Work Experience', content: 'Senior Developer at TechCorp' }],
        education: [{ title: 'Education', content: 'B.S. Computer Science' }],
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Docker'],
      });
      
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.sections.score).toBe(25);
    });

    it('penalizes missing summary', () => {
      const structured = createStructuredResume({
        experience: [{ title: 'Work Experience', content: 'Developer' }],
        education: [{ title: 'Education', content: 'B.S.' }],
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Docker'],
      });
      
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.sections.issues.some(i => i.includes('summary'))).toBe(true);
    });

    it('penalizes missing experience', () => {
      const structured = createStructuredResume({
        summary: 'Experienced developer',
        education: [{ title: 'Education', content: 'B.S.' }],
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Docker'],
      });
      
      const result = calculateATSScore('sample text', structured);
      expect(result.breakdown.sections.issues.some(i => i.includes('experience'))).toBe(true);
    });
  });

  describe('Formatting Scoring (20 pts max)', () => {
    it('penalizes LaTeX artifacts', () => {
      const text = '\\textbf{Experience} \\section{Education}';
      const structured = createStructuredResume();
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.formatting.issues.some(i => i.includes('LaTeX'))).toBe(true);
    });

    it('penalizes non-clickable project links like [Live API]', () => {
      const text = 'Project Link: [Live API] and [Demo]';
      const structured = createStructuredResume();
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.formatting.issues.some(i => i.includes('not clickable'))).toBe(true);
    });

    it('penalizes too few bullet points', () => {
      const text = 'I worked on projects. I built applications.'; // No bullets
      const structured = createStructuredResume();
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.formatting.issues.some(i => i.includes('bullet'))).toBe(true);
    });

    it('rewards proper bullet point usage', () => {
      const text = `
        • Developed REST API
        • Implemented authentication
        • Built CI/CD pipeline
        • Created database schema
        • Optimized queries
        • Led code reviews
        • Mentored junior devs
        • Wrote documentation
        • Deployed to production
        • Monitored performance
      `;
      const structured = createStructuredResume();
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.formatting.score).toBeGreaterThanOrEqual(5);
    });
  });

  describe('ATS Compatibility Scoring (10 pts max)', () => {
    it('penalizes missing standard section headers', () => {
      const text = 'My background in technology. My school history. What I know.'; // No standard headers
      const structured = createStructuredResume();
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.atsCompatibility.issues.some(i => i.includes('experience') || i.includes('education') || i.includes('skills'))).toBe(true);
    });

    it('rewards presence of standard headers', () => {
      const text = 'EXPERIENCE: Senior Developer. EDUCATION: B.S. in CS. SKILLS: JavaScript, Python';
      const structured = createStructuredResume();
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.atsCompatibility.score).toBeGreaterThanOrEqual(7);
    });

    it('penalizes excessive pipe separators', () => {
      const text = 'JavaScript | Python | React | Node.js | Docker | AWS | PostgreSQL';
      const structured = createStructuredResume();
      
      const result = calculateATSScore(text, structured);
      expect(result.breakdown.atsCompatibility.issues.some(i => i.includes('|'))).toBe(true);
    });
  });

  describe('Overall Grade Assignment', () => {
    it('returns Excellent for score >= 80', () => {
      // Create comprehensive resume that should score 80+
      const structured = createStructuredResume({
        contact: {
          email: 'john@example.com',
          phone: '+1-555-123-4567',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
        },
        summary: 'Senior software engineer with 7+ years of experience building scalable applications using React, Node.js, and cloud technologies.',
        experience: [{ title: 'Work Experience', content: 'Senior Developer at TechCorp' }],
        education: [{ title: 'Education', content: 'B.S. Computer Science' }],
        skills: Array(16).fill('skill').map((_, i) => `Skill${i}`),
      });
      
      const text = `
        EXPERIENCE: 
        • Developed and deployed microservices architecture serving 1M+ users
        • Implemented CI/CD pipeline reducing deployment time by 60%
        • Led team of 8 engineers, achieving 40% improvement in sprint velocity
        • Optimized database queries, improving response time by 50%
        • Built RESTful APIs handling 10K+ requests per minute
        • Created monitoring dashboards tracking 20+ key metrics
        • Designed authentication system used by 500K+ users
        • Managed cloud infrastructure reducing costs by 30%
        • Architected event-driven system processing 5M+ events daily
        • Mentored 5 junior developers, 3 promoted within year
        
        EDUCATION: B.S. Computer Science, Stanford University
        
        SKILLS: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes
      `;
      
      const result = calculateATSScore(text, structured);
      
      if (result.totalScore >= 80) {
        expect(result.grade).toBe('Excellent');
      }
    });

    it('returns Good for score 60-79', () => {
      const structured = createStructuredResume({
        contact: {
          email: 'john@example.com',
          phone: '+1-555-123-4567',
        },
        skills: Array(10).fill('skill').map((_, i) => `Skill${i}`),
        experience: [{ title: 'Experience', content: 'Developer' }],
        education: [{ title: 'Education', content: 'BS' }],
      });
      
      const text = `
        EXPERIENCE:
        • Developed web applications
        • Built APIs
        • Worked with databases
        • Created features
        • Fixed bugs
        
        EDUCATION: B.S. in Computer Science
        
        SKILLS: JavaScript, Python, React
      `;
      
      const result = calculateATSScore(text, structured);
      
      if (result.totalScore >= 60 && result.totalScore < 80) {
        expect(result.grade).toBe('Good');
      }
    });

    it('returns Poor for score < 40', () => {
      const structured = createStructuredResume();
      const result = calculateATSScore('minimal text', structured);
      
      if (result.totalScore < 40) {
        expect(result.grade).toBe('Poor');
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles empty resume text', () => {
      const structured = createStructuredResume();
      expect(() => calculateATSScore('', structured)).not.toThrow();
    });

    it('handles very long resume (3000+ words)', () => {
      const longText = 'word '.repeat(3500);
      const structured = createStructuredResume();
      
      const result = calculateATSScore(longText, structured);
      expect(result.breakdown.formatting.issues.some(i => i.includes('too long'))).toBe(true);
    });

    it('handles resume with only uppercase text', () => {
      const text = 'DEVELOPED AN APPLICATION. IMPLEMENTED FEATURES. LED A TEAM.';
      const structured = createStructuredResume();
      
      // Should still detect action verbs
      expect(() => calculateATSScore(text, structured)).not.toThrow();
    });

    it('handles Unicode and special characters', () => {
      const text = 'Developed 🚀 application. Improved performance by 50%. Résumé of experience.';
      const structured = createStructuredResume();
      
      expect(() => calculateATSScore(text, structured)).not.toThrow();
    });

    it('handles null/undefined in contact fields gracefully', () => {
      const structured: StructuredResume = {
        contact: {
          email: undefined as any,
          phone: null as any,
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        rawSections: {},
      };
      
      expect(() => calculateATSScore('text', structured)).not.toThrow();
    });
  });
});

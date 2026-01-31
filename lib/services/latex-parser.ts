/**
 * LaTeX Resume Parser
 * Extracts text content from LaTeX/Overleaf resume files
 * for ATS analysis and improvement suggestions
 */

export interface ParsedLatexSection {
  type: 'header' | 'section' | 'item' | 'text';
  name?: string;
  content: string;
  rawLatex: string;
}

export interface ParsedLatexResume {
  fullText: string;
  sections: ParsedLatexSection[];
  rawLatex: string;
}

/**
 * Parse LaTeX content and extract readable text for ATS analysis
 */
export function parseLatexContent(latexContent: string): ParsedLatexResume {
  const sections: ParsedLatexSection[] = [];
  let fullText = latexContent;
  
  // Remove comments
  fullText = fullText.replace(/%.*$/gm, '');
  
  // Remove document class and packages
  fullText = fullText.replace(/\\documentclass(\[.*?\])?\{.*?\}/g, '');
  fullText = fullText.replace(/\\usepackage(\[.*?\])?\{.*?\}/g, '');
  fullText = fullText.replace(/\\RequirePackage(\[.*?\])?\{.*?\}/g, '');
  
  // Remove preamble commands
  fullText = fullText.replace(/\\geometry\{[^}]*\}/g, '');
  fullText = fullText.replace(/\\pagestyle\{.*?\}/g, '');
  fullText = fullText.replace(/\\setlength\{[^}]*\}\{[^}]*\}/g, '');
  fullText = fullText.replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, '');
  fullText = fullText.replace(/\\newcommand\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}/g, '');
  
  // Extract sections
  const sectionRegex = /\\section\*?\{([^}]*)\}/g;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(latexContent)) !== null) {
    sections.push({
      type: 'section',
      name: sectionMatch[1],
      content: sectionMatch[1],
      rawLatex: sectionMatch[0]
    });
  }
  
  // Extract subsections
  const subsectionRegex = /\\subsection\*?\{([^}]*)\}/g;
  while ((sectionMatch = subsectionRegex.exec(latexContent)) !== null) {
    sections.push({
      type: 'section',
      name: sectionMatch[1],
      content: sectionMatch[1],
      rawLatex: sectionMatch[0]
    });
  }
  
  // Remove begin/end document
  fullText = fullText.replace(/\\begin\{document\}/g, '');
  fullText = fullText.replace(/\\end\{document\}/g, '');
  
  // Convert common LaTeX to text
  fullText = fullText.replace(/\\textbf\{([^}]*)\}/g, '$1');
  fullText = fullText.replace(/\\textit\{([^}]*)\}/g, '$1');
  fullText = fullText.replace(/\\underline\{([^}]*)\}/g, '$1');
  fullText = fullText.replace(/\\emph\{([^}]*)\}/g, '$1');
  fullText = fullText.replace(/\\textsc\{([^}]*)\}/g, '$1');
  fullText = fullText.replace(/\\textsf\{([^}]*)\}/g, '$1');
  fullText = fullText.replace(/\\texttt\{([^}]*)\}/g, '$1');
  
  // Handle href/url
  fullText = fullText.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '$2 ($1)');
  fullText = fullText.replace(/\\url\{([^}]*)\}/g, '$1');
  
  // Convert sections to headers
  fullText = fullText.replace(/\\section\*?\{([^}]*)\}/g, '\n\n$1\n');
  fullText = fullText.replace(/\\subsection\*?\{([^}]*)\}/g, '\n$1\n');
  
  // Convert items
  fullText = fullText.replace(/\\item\s*/g, '• ');
  
  // Remove remaining environments
  fullText = fullText.replace(/\\begin\{[^}]*\}/g, '');
  fullText = fullText.replace(/\\end\{[^}]*\}/g, '');
  
  // Remove remaining commands  
  fullText = fullText.replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})?/g, ' ');
  
  // Clean up special characters
  fullText = fullText.replace(/\\&/g, '&');
  fullText = fullText.replace(/\\%/g, '%');
  fullText = fullText.replace(/\\$/g, '$');
  fullText = fullText.replace(/\\\\/g, ' ');
  fullText = fullText.replace(/\\-/g, '-');
  fullText = fullText.replace(/---/g, '—');
  fullText = fullText.replace(/--/g, '–');
  fullText = fullText.replace(/``/g, '"');
  fullText = fullText.replace(/''/g, '"');
  fullText = fullText.replace(/`/g, "'");
  fullText = fullText.replace(/~/g, ' ');
  
  // Clean up whitespace
  fullText = fullText.replace(/\n{3,}/g, '\n\n');
  fullText = fullText.replace(/[ \t]+/g, ' ');
  fullText = fullText.trim();
  
  return {
    fullText,
    sections,
    rawLatex: latexContent
  };
}

/**
 * Apply ATS-friendly improvements to LaTeX content
 * Returns the modified LaTeX with minimal changes
 */
export function applyLatexImprovements(
  originalLatex: string, 
  improvements: Array<{ find: string; replace: string }>
): string {
  let modifiedLatex = originalLatex;
  
  for (const improvement of improvements) {
    // Try exact match first
    if (modifiedLatex.includes(improvement.find)) {
      modifiedLatex = modifiedLatex.replace(improvement.find, improvement.replace);
    }
  }
  
  return modifiedLatex;
}

/**
 * Extract a specific section from LaTeX content
 */
export function extractLatexSection(latexContent: string, sectionName: string): string | null {
  const regex = new RegExp(`\\\\section\\*?\\{${sectionName}\\}([\\s\\S]*?)(?=\\\\section|\\\\end\\{document\\}|$)`, 'i');
  const match = latexContent.match(regex);
  return match ? match[1].trim() : null;
}

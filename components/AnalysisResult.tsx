'use client';

import { ResumeAnalysis } from '@/lib/ai/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

import { JobTailorModal } from './analysis/JobTailorModal';
import { OptimizationPanel } from './analysis/OptimizationPanel';

interface AnalysisResultProps {
  analysis: ResumeAnalysis;
  resumeText: string;
}

export function AnalysisResult({ analysis, resumeText }: AnalysisResultProps) {
  // Helper to parse bold markdown **text**
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-text-primary dark:text-dark-text-primary">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Section: Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex items-center justify-center p-6 bg-white dark:bg-dark-surface border-border dark:border-dark-border">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-dark-text-primary">ATS Score</h3>
            <CircularProgress 
              value={analysis.score} 
              size={180} 
              strokeWidth={12} 
              color={analysis.score >= 80 ? 'success' : analysis.score >= 60 ? 'warning' : 'danger'}
            />
          </div>
        </Card>

        <Card className="md:col-span-2 bg-white dark:bg-dark-surface border-border dark:border-dark-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Executive Summary</CardTitle>
            <JobTailorModal resumeText={resumeText} />
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {formatText(analysis.summary)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Skills Detected</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Hard Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.hardSkills.map((skill, i) => (
                  <Badge key={i} variant="default">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-muted dark:text-dark-text-muted mb-2">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.softSkills.map((skill, i) => (
                  <Badge key={i} variant="info">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader><CardTitle>Analysis Details</CardTitle></CardHeader>
           <CardContent className="space-y-4">
              {analysis.missingSections.length > 0 && (
                 <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Missing Sections</h4>
                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-200">
                       {analysis.missingSections.map((item, i) => <li key={i}>{formatText(item)}</li>)}
                    </ul>
                 </div>
              )}
               {analysis.formattingIssues.length > 0 && (
                 <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Formatting Issues</h4>
                    <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-200">
                       {analysis.formattingIssues.map((item, i) => <li key={i}>{formatText(item)}</li>)}
                    </ul>
                 </div>
              )}
           </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-l-4 border-l-emerald-500">
            <CardHeader><CardTitle>Strengths</CardTitle></CardHeader>
            <CardContent>
               <ul className="space-y-2">
                  {analysis.strengths.map((item, i) => (
                     <li key={i} className="flex items-start gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> 
                        <span>{formatText(item)}</span>
                     </li>
                  ))}
               </ul>
            </CardContent>
         </Card>

         <Card className="border-l-4 border-l-red-500">
            <CardHeader><CardTitle>Improvements Needed</CardTitle></CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {analysis.improvementSuggestions.map((item, i) => (
                     <div key={i} className="group">
                       <div className="flex items-start gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                          <span className="text-red-500 mt-0.5 shrink-0">!</span> 
                          <span>{formatText(item)}</span>
                       </div>
                       <OptimizationPanel originalText={item} type="bullet" resumeContext={resumeText} />
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

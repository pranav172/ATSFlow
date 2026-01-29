'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/Progress';

interface ReportData {
  resume: any;
  atsScore: number;
  atsAnalysis: any;
  jobPredictions?: {
    roles: Array<{
      title: string;
      confidence: number;
      companies: string[];
      reasoning: string;
    }>;
    experienceLevel: string;
    industries: string[];
  };
  projectImpact?: Array<{
    projectName: string;
    complexity: number;
    impact: string;
    technologies: string[];
    suggestions: string[];
  }>;
  skillGaps?: {
    present: string[];
    missing: string[];
    recommended: Array<{
      skill: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
    }>;
  };
  careerInsights?: {
    nextStep: string;
    timeline: string;
    recommendations: string[];
  };
}

export default function ReportClient({ initialData }: { initialData: ReportData }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(initialData);

  const generateFullReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/resumes/${initialData.resume.id}/generate-report`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData({ ...reportData, ...data });
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const { resume, atsScore, atsAnalysis, jobPredictions, projectImpact, skillGaps, careerInsights } = reportData;

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary dark:text-slate-100 mb-2">
            📊 Comprehensive Analysis Report
          </h1>
          <p className="text-lg text-text-secondary dark:text-slate-300">
            {resume.originalFilename}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Back
          </Button>
          <Button 
            variant="primary" 
            onClick={generateFullReport}
            disabled={isGenerating}
          >
            {isGenerating ? '🤖 Generating...' : '🤖 Generate AI Insights'}
          </Button>
        </div>
      </div>

      {/* Overall Score Summary */}
      <Card className="bg-gradient-to-br from-primary/10 to-violet-50 dark:from-purple-900/20 dark:to-dark-surface border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center">
              <CircularProgress value={atsScore} size={140} strokeWidth={12} showLabel label="/ 100" />
              <p className="mt-3 text-sm font-semibold text-text-muted dark:text-slate-400">
                ATS Compatibility Score
              </p>
            </div>
            
            <div className="col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary dark:text-slate-100 mb-2">
                  📈 Your Resume Strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {atsAnalysis?.aiAnalysis?.strengths?.slice(0, 3).map((strength: string, idx: number) => (
                    <Badge key={idx} className="bg-success/10 text-success border border-success/20">
                      ✓ {strength.slice(0, 50)}{strength.length > 50 ? '...' : ''}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-text-primary dark:text-slate-100 mb-2">
                  ⚠️ Key Areas to Improve
                </h3>
                <div className="space-y-1">
                  {atsAnalysis?.breakdown && Object.entries(atsAnalysis.breakdown)
                    .filter(([_, data]: [string, any]) => data.issues && data.issues.length > 0)
                    .slice(0, 3)
                    .map(([_category, data]: [string, any], idx: number) => (
                      <p key={idx} className="text-sm text-text-secondary dark:text-slate-300">
                        • {data.issues[0]}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Role Predictions */}
      {jobPredictions ? (
        <Card className="bg-white dark:bg-dark-surface">
          <CardHeader>
            <CardTitle>🎯 Best Suited Job Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobPredictions.roles.map((role, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg text-text-primary dark:text-slate-100">
                        {role.title}
                      </h4>
                      <p className="text-sm text-text-muted dark:text-slate-400 mt-1">
                        {role.reasoning}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircularProgress value={role.confidence} size={60} strokeWidth={6} showLabel />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                      Experience: {jobPredictions.experienceLevel}
                    </Badge>
                    {role.companies.slice(0, 3).map((company, i) => (
                      <Badge key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-dark-surface">
          <CardContent className="py-12 text-center">
            <p className="text-text-muted dark:text-slate-400 mb-4">
              🤖 Click "Generate AI Insights" to get job role predictions
            </p>
            <Button onClick={generateFullReport} disabled={isGenerating}>
              {isGenerating ? 'Analyzing...' : 'Generate Now'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project Impact Analysis */}
      {projectImpact && projectImpact.length > 0 && (
        <Card className="bg-white dark:bg-dark-surface">
          <CardHeader>
            <CardTitle>💼 Project Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectImpact.map((project, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-text-primary dark:text-slate-100">
                      {project.projectName}
                    </h4>
                    <Badge className={
                      project.complexity >= 8 ? 'bg-danger text-white' :
                      project.complexity >= 6 ? 'bg-warning text-white' :
                      'bg-success text-white'
                    }>
                      Complexity: {project.complexity}/10
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-text-secondary dark:text-slate-300 mb-3">
                    💡 {project.impact}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.map((tech, i) => (
                      <Badge key={i} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  {project.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-text-muted dark:text-slate-400 mb-2">
                        Suggestions to highlight:
                      </p>
                      <ul className="space-y-1">
                        {project.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-text-secondary dark:text-slate-300">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Gap Analysis */}
      {skillGaps && (
        <Card className="bg-white dark:bg-dark-surface">
          <CardHeader>
            <CardTitle>🔧 Skill Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-success mb-3">✅ Skills You Have</h4>
                <div className="flex flex-wrap gap-2">
                  {skillGaps.present.slice(0, 15).map((skill, idx) => (
                    <Badge key={idx} className="bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:border-success/30">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-warning mb-3">📈 Skills to Add</h4>
                <div className="space-y-2">
                  {skillGaps.recommended.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Badge className={
                        item.priority === 'high' ? 'bg-danger text-white' :
                        item.priority === 'medium' ? 'bg-warning text-white' :
                        'bg-slate-400 text-white'
                      }>
                        {item.priority}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary dark:text-slate-100">
                          {item.skill}
                        </p>
                        <p className="text-xs text-text-muted dark:text-slate-400">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Trajectory */}
      {careerInsights && (
        <Card className="bg-white dark:bg-dark-surface">
          <CardHeader>
            <CardTitle>🚀 Career Trajectory Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-primary dark:text-slate-100 mb-2">
                  Next Logical Step:
                </h4>
                <p className="text-text-secondary dark:text-slate-300">
                  {careerInsights.nextStep}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-text-primary dark:text-slate-100 mb-2">
                  Timeline:
                </h4>
                <p className="text-text-secondary dark:text-slate-300">
                  {careerInsights.timeline}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-text-primary dark:text-slate-100 mb-2">
                  Recommendations:
                </h4>
                <ul className="space-y-2">
                  {careerInsights.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span className="text-text-secondary dark:text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full detailed breakdown - Existing analysis */}
      {atsAnalysis?.breakdown && (
        <Card className="bg-white dark:bg-dark-surface">
          <CardHeader>
            <CardTitle>📋 Detailed ATS Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(atsAnalysis.breakdown).map(([category, data]: [string, any]) => (
                <div key={category} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-text-primary dark:text-slate-100 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-bold text-text-primary dark:text-slate-100">
                      {data.score}/{data.max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        (data.score / data.max) >= 0.8 ? 'bg-success' :
                        (data.score / data.max) >= 0.6 ? 'bg-warning' : 'bg-danger'
                      }`}
                      style={{ width: `${(data.score / data.max) * 100}%` }}
                    />
                  </div>
                  {data.issues && data.issues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {data.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="text-sm text-text-secondary dark:text-slate-300 flex items-start">
                          <span className="text-warning mr-2">⚠</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

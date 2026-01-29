'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

interface ATSAnalysisProps {
  resumeId: string;
  initialScore?: number;
  initialAnalysis?: any;
}

export function ATSAnalysisSection({ resumeId, initialScore, initialAnalysis }: ATSAnalysisProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atsScore, setAtsScore] = useState(initialScore || 0);
  const [analysis, setAnalysis] = useState(initialAnalysis);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'NO_CREDITS') {
          setError('No credits remaining. Upgrade to Pro for unlimited analysis!');
        } else {
          setError(data.error || 'Analysis failed');
        }
        return;
      }

      setAtsScore(data.atsScore);
      setAnalysis(data.analysis);
      
      // Refresh page to show updated data
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'Excellent') return 'bg-success';
    if (grade === 'Good') return 'bg-warning';
    if (grade === 'Fair') return 'bg-orange-500';
    return 'bg-danger';
  };

  return (
    <>
      {/* ATS Score Card */}
      <Card className="bg-white dark:bg-dark-surface">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ATS Score</CardTitle>
              <p className="text-sm text-text-muted dark:text-slate-400 mt-1">
                {analysis ? 'AI-powered resume analysis' : 'Click analyze to get your ATS score'}
              </p>
            </div>
            {!analysis && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="min-w-32"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            )}
            {analysis && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                variant="outline"
                className="min-w-32"
              >
                Re-analyze
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-text-secondary dark:text-slate-300">Analyzing your resume with AI...</p>
              <p className="text-sm text-text-muted dark:text-slate-400 mt-2">This may take 10-15 seconds</p>
            </div>
          )}

          {!isAnalyzing && !analysis && (
            <div className="flex items-center justify-center py-8">
              <CircularProgress value={0} size={150} strokeWidth={12} />
            </div>
          )}

          {!isAnalyzing && analysis && (
            <div className="space-y-6">
              {/* Score Display */}
              <div className="flex items-center justify-center py-4">
                <CircularProgress
                  value={atsScore}
                  size={180}
                  strokeWidth={14}
                  showLabel={true}
                  label="/ 100"
                />
              </div>

              {/* Grade Badge */}
              {analysis.grade && (
                <div className="flex justify-center">
                  <Badge className={`${getGradeColor(analysis.grade)} text-white px-4 py-2 text-base`}>
                    {analysis.grade}
                  </Badge>
                </div>
              )}

              {/* DETAILED BREAKDOWN - PRIMARY ANALYSIS */}
              {analysis.breakdown && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-text-primary dark:text-slate-100 mb-4">
                    📊 Detailed Analysis & Issues
                  </h3>
                  <div className="space-y-5">
                    {Object.entries(analysis.breakdown).map(([category, data]: [string, any]) => (
                      <div key={category} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-text-primary dark:text-slate-100 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${
                              (data.score / data.max) >= 0.8 ? 'text-success' :
                              (data.score / data.max) >= 0.6 ? 'text-warning' : 'text-danger'
                            }`}>
                              {data.score}/{data.max}
                            </span>
                            <span className="text-xs text-text-muted dark:text-slate-400">
                              ({Math.round((data.score / data.max) * 100)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              (data.score / data.max) >= 0.8 ? 'bg-success' :
                              (data.score / data.max) >= 0.6 ? 'bg-warning' : 'bg-danger'
                            }`}
                            style={{ width: `${(data.score / data.max) * 100}%` }}
                          ></div>
                        </div>
                        {data.issues && data.issues.length > 0 && (
                          <ul className="mt-2 space-y-2 bg-white dark:bg-slate-800 p-3 rounded">
                            {data.issues.map((issue: string, idx: number) => (
                              <li key={idx} className="text-sm text-text-secondary dark:text-slate-300 flex items-start">
                                <span className="text-warning mr-2 flex-shrink-0 mt-0.5">⚠</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI-Generated Improvements (Secondary) */}
              {analysis.aiAnalysis?.improvements && analysis.aiAnalysis.improvements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-slate-100 mb-3 flex items-center gap-2">
                    <span>🤖</span>
                    <span>AI-Suggested Improvements</span>
                    <Badge className="bg-primary text-white text-xs">Powered by Groq</Badge>
                  </h3>
                  <div className="space-y-3">
                    {analysis.aiAnalysis.improvements.map((improvement: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border-l-4 border-primary">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            {improvement.category}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              improvement.priority === 'high' 
                                ? 'bg-danger text-white' 
                                : improvement.priority === 'medium'
                                ? 'bg-warning text-white'
                                : 'bg-slate-400 text-white'
                            }`}
                          >
                            {improvement.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-text-primary dark:text-slate-100 mb-1">
                          {improvement.issue}
                        </p>
                        <p className="text-sm text-text-secondary dark:text-slate-300">
                          💡 {improvement.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths (Condensed) */}
              {analysis.aiAnalysis?.strengths && analysis.aiAnalysis.strengths.length > 0 && (
                <details className="bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <summary className="cursor-pointer p-3 font-semibold text-success flex items-center gap-2">
                    ✅ Your Strengths ({analysis.aiAnalysis.strengths.length})
                  </summary>
                  <ul className="px-4 pb-3 space-y-1">
                    {analysis.aiAnalysis.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="text-sm text-text-secondary dark:text-slate-300 flex items-start">
                        <span className="text-success mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Missing Keywords */}
              {analysis.aiAnalysis?.missingKeywords && analysis.aiAnalysis.missingKeywords.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-slate-100 mb-3">
                    🔑 Recommended Keywords to Add
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.aiAnalysis.missingKeywords.slice(0, 15).map((keyword: string, idx: number) => (
                      <Badge key={idx} className="border border-warning text-warning bg-yellow-50 dark:bg-yellow-900/20">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted dark:text-slate-400 mt-2">
                    Add these keywords naturally in your experience and skills sections
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';

interface JDMatchResult {
  overallMatchScore: number;
  keywordMatchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillGapAnalysis: Array<{
    skill: string;
    importance: 'required' | 'preferred' | 'nice-to-have';
    mentionCount: number;
    suggestion: string;
  }>;
  recommendations: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    issue: string;
    action: string;
  }>;
}

interface JDMatcherProps {
  resumeId: string;
}

export function JDMatcher({ resumeId }: JDMatcherProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JDMatchResult | null>(null);

  const handleMatch = async () => {
    if (jobDescription.trim().length < 50) {
      setError('Please paste at least 50 characters of job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Match analysis failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getImportanceBadge = (importance: string) => {
    const colors: Record<string, string> = {
      'required': 'bg-red-500 text-white',
      'preferred': 'bg-yellow-500 text-white',
      'nice-to-have': 'bg-gray-400 text-white',
    };
    return colors[importance] || 'bg-gray-400 text-white';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'high': 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
      'medium': 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
      'low': 'border-l-gray-400 bg-gray-50 dark:bg-gray-800',
    };
    return colors[priority] || 'border-l-gray-400';
  };

  return (
    <Card className="bg-white dark:bg-dark-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Job Description Match
          <Badge className="bg-primary text-white text-xs">Key Feature</Badge>
        </CardTitle>
        <p className="text-sm text-text-muted dark:text-slate-400 mt-1">
          Paste a job description to see how well your resume matches
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary dark:text-slate-100">
            Job Description
          </label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[150px] resize-y"
            disabled={isAnalyzing}
          />
          <p className="text-xs text-text-muted dark:text-slate-400 mt-1">
            {jobDescription.length} characters • Min 50 required
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button 
          onClick={handleMatch} 
          disabled={isAnalyzing || jobDescription.length < 50}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing Match...' : 'Analyze Match'}
        </Button>

        {result && (
          <div className="space-y-6 mt-4 animate-in fade-in duration-500">
            {/* Match Score */}
            <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p className="text-sm text-text-muted dark:text-slate-400 mb-2">
                Overall Match Score
              </p>
              <p className={`text-6xl font-bold ${getScoreColor(result.overallMatchScore)}`}>
                {result.overallMatchScore}%
              </p>
              <p className="text-sm mt-2">
                Keyword Match: <span className="font-semibold">{result.keywordMatchScore}%</span>
              </p>
            </div>

            {/* Matched Keywords */}
            {result.matchedKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-success flex items-center gap-2">
                  ✅ Matched Keywords ({result.matchedKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((kw, idx) => (
                    <Badge key={idx} className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {result.missingKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-danger flex items-center gap-2">
                  ❌ Missing Keywords ({result.missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.slice(0, 15).map((kw, idx) => (
                    <Badge key={idx} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      {kw}
                    </Badge>
                  ))}
                  {result.missingKeywords.length > 15 && (
                    <Badge className="bg-gray-100 text-gray-600">
                      +{result.missingKeywords.length - 15} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Skill Gap Analysis */}
            {result.skillGapAnalysis.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  📊 Skill Gap Analysis
                </h4>
                <div className="space-y-2">
                  {result.skillGapAnalysis.slice(0, 5).map((gap, idx) => (
                    <div 
                      key={idx} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg gap-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getImportanceBadge(gap.importance)}>
                          {gap.importance}
                        </Badge>
                        <span className="font-medium text-sm">{gap.skill}</span>
                        <span className="text-xs text-muted-foreground">
                          (mentioned {gap.mentionCount}x)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  💡 Recommendations
                </h4>
                <div className="space-y-3">
                  {result.recommendations.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 border-l-4 rounded-r-lg ${getPriorityColor(rec.priority)}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs capitalize bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {rec.category}
                        </Badge>
                        <Badge className={`text-xs ${
                          rec.priority === 'high' ? 'bg-red-500 text-white' :
                          rec.priority === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-gray-400 text-white'
                        }`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-text-primary dark:text-slate-100">
                        {rec.issue}
                      </p>
                      <p className="text-sm text-text-muted dark:text-slate-400 mt-1">
                        → {rec.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

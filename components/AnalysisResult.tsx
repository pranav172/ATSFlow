'use client';

import { useState } from 'react';
import { ResumeAnalysis } from '@/lib/ai/schema';
import { Card, CardContent } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { JobTailorModal } from './analysis/JobTailorModal';
import { OptimizationPanel } from './analysis/OptimizationPanel';
import { Briefcase, AlertTriangle, Lightbulb, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface AnalysisResultProps {
  analysis: ResumeAnalysis;
  resumeText: string;
}

type TabType = 'skills' | 'issues' | 'tips';

export function AnalysisResult({ analysis, resumeText }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const [expandedStrengths, setExpandedStrengths] = useState(false);
  const [expandedImprovements, setExpandedImprovements] = useState(true);

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const tabs = [
    { id: 'skills' as TabType, label: 'Skills', icon: Briefcase, count: analysis.hardSkills.length + analysis.softSkills.length },
    { id: 'issues' as TabType, label: 'Issues', icon: AlertTriangle, count: analysis.missingSections.length + analysis.formattingIssues.length },
    { id: 'tips' as TabType, label: 'Tips', icon: Lightbulb, count: analysis.improvementSuggestions.length },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Score Ring */}
          <div className="relative">
            <CircularProgress 
              value={analysis.score} 
              size={180} 
              strokeWidth={12} 
              color={analysis.score >= 80 ? 'success' : analysis.score >= 60 ? 'warning' : 'danger'}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold">{analysis.score}</span>
            </div>
          </div>
          
          {/* Summary */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-3">ATS Compatibility Score</h2>
            <p className="text-gray-300 leading-relaxed mb-4 max-w-xl">
              {analysis.summary.slice(0, 200)}...
            </p>
            <JobTailorModal resumeText={resumeText} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'skills' && (
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" /> Hard Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.hardSkills.map((skill, i) => (
                    <Badge 
                      key={i} 
                      variant="default"
                      className="px-3 py-1.5 text-sm hover:scale-105 transition-transform cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" /> Soft Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.softSkills.map((skill, i) => (
                    <Badge 
                      key={i} 
                      variant="info"
                      className="px-3 py-1.5 text-sm hover:scale-105 transition-transform cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-4">
            {analysis.missingSections.length > 0 && (
              <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4">
                    Missing Sections
                  </h3>
                  <ul className="space-y-2">
                    {analysis.missingSections.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-red-500 mt-0.5">•</span>
                        {formatText(item)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.formattingIssues.length > 0 && (
              <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4">
                    Formatting Issues
                  </h3>
                  <ul className="space-y-2">
                    {analysis.formattingIssues.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {formatText(item)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.missingSections.length === 0 && analysis.formattingIssues.length === 0 && (
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-8 text-center">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-700 dark:text-green-400">
                    No major issues found!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Your resume formatting looks good.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-4">
            {/* Strengths - Collapsible */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <button
                onClick={() => setExpandedStrengths(!expandedStrengths)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Check className="w-5 h-5" /> Strengths ({analysis.strengths.length})
                </h3>
                {expandedStrengths ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedStrengths && (
                <CardContent className="pt-0 pb-6 px-6">
                  <ul className="space-y-2">
                    {analysis.strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {formatText(item)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>

            {/* Improvements - Collapsible */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <button
                onClick={() => setExpandedImprovements(!expandedImprovements)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <h3 className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" /> Improvements ({analysis.improvementSuggestions.length})
                </h3>
                {expandedImprovements ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedImprovements && (
                <CardContent className="pt-0 pb-6 px-6 space-y-4">
                  {analysis.improvementSuggestions.map((item, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                      <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-purple-500 mt-0.5 font-bold">{i + 1}</span>
                        <div className="flex-1">
                          <span>{formatText(item)}</span>
                          <OptimizationPanel originalText={item} type="bullet" resumeContext={resumeText} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

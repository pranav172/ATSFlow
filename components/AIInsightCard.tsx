'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Pre-defined tips for instant display (no API call needed)
const DAILY_TIPS = [
  {
    icon: '📝',
    title: 'Use action verbs',
    tip: 'Start bullets with verbs like "Led", "Designed", "Increased" instead of "Responsible for".',
  },
  {
    icon: '📊',
    title: 'Quantify achievements',
    tip: 'Add numbers: "Increased sales by 25%" is stronger than "Improved sales".',
  },
  {
    icon: '🔑',
    title: 'Match keywords',
    tip: 'Mirror exact phrases from the job description in your resume.',
  },
  {
    icon: '📋',
    title: 'Keep it concise',
    tip: 'Aim for 1-2 lines per bullet. Recruiters spend 7 seconds per resume.',
  },
  {
    icon: '🎯',
    title: 'Tailor each application',
    tip: "Customize your summary for each job - one size doesn't fit all.",
  },
  {
    icon: '🔗',
    title: 'Add links',
    tip: 'Include LinkedIn, GitHub, or portfolio links to showcase your work.',
  },
  {
    icon: '✨',
    title: 'Simple formatting',
    tip: "ATS cannot read tables, images, or fancy fonts. Keep it simple.",
  },
  {
    icon: '📅',
    title: 'Recent first',
    tip: 'List your most recent experience first - reverse chronological order.',
  },
];

export function AIInsightCard() {
  const [tip, setTip] = useState(DAILY_TIPS[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Pick a random tip based on day
    const dayIndex = new Date().getDate() % DAILY_TIPS.length;
    setTip(DAILY_TIPS[dayIndex]);
  }, []);

  const refreshTip = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
      setTip(DAILY_TIPS[randomIndex]);
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-900 dark:to-blue-900/20 border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Daily AI Tip</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshTip}
            className="h-7 w-7 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            ) : (
              <RefreshCw className="w-4 h-4 text-purple-600" />
            )}
          </Button>
        </div>
        
        <div className="flex items-start gap-3">
          <span className="text-2xl">{tip.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              {tip.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {tip.tip}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

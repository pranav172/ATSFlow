'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { tailorResumeToJob } from '@/lib/actions/optimize-actions';
import { Loader2, Briefcase, Check, Copy } from 'lucide-react';


// Quick Mock for Dialog if not exists, but let's assume standard UI pattern or we'll build it.
// Actually, standard Shadcn Dialog is complex to implement from scratch in one file if not already there.
// I'll assume usage of a simple overlay or I should check if I have Dialog components.
// I'll check 'components/ui' first. If Dialog isn't there, I'll use a simple conditional render for now or make it a simple full-screen overlay.
// Checking file list previously... I saw 'components'. 
// I'll implement a simple one-off Modal logic inside this component to avoid dependency hell if Shadcn isn't fully set up.

// Wait, looking at previous file lists, I didn't see 'Dialog'.
// I will implement a custom simple modal to ensure it works without errors.

export function JobTailorModal({ resumeText }: { resumeText: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    tailoredSummary: string; 
    missingKeywords: string[]; 
    matchScore: number; 
    skillGaps: string[]; 
    suggestedRewrites: { original: string; rewritten: string }[] 
  } | null>(null);

  const handleAnalyze = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    try {
      const data = await tailorResumeToJob(resumeText, jd);
      setResult(data);
    } catch (error) {
      alert('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
        <Briefcase className="w-4 h-4" /> Tailor to Job
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto flex flex-col border border-border dark:border-border">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-500" /> Job Tailoring
             </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Paste a Job Description to get targeted advice.
             </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
        </div>

        {/* content */}
        <div className="p-4 md:p-8 space-y-8 md:space-y-10 flex-1">
          {!result ? (
            <div className="space-y-6 max-w-4xl mx-auto py-12">
              <label className="block text-xl font-semibold text-gray-900 dark:text-white text-center mb-4">
                Paste the Job Description
              </label>
              <Textarea 
                placeholder="Paste the full job description here..." 
                className="min-h-[300px] text-base p-6 leading-relaxed shadow-sm border-gray-300 dark:border-gray-700 resize-none focus:ring-2 focus:ring-purple-500"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
              <Button 
                className="w-full h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/20" 
                onClick={handleAnalyze} 
                disabled={loading || !jd.trim()}
              >
                {loading ? <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Analyzing Match...</> : 'Analyze Match'}
              </Button>
            </div>
          ) : (
            <div className="space-y-8 md:space-y-10">
               {/* Score & Summary */}
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                  {/* Match Score Column */}
                  <div className="lg:col-span-1 space-y-3 flex flex-col">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 h-8">
                        Match Score
                     </h3>
                     <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 p-6 rounded-xl flex flex-col items-center justify-center text-center flex-1 min-h-[220px]">
                        <div className="relative flex items-center justify-center mb-6">
                           {/* Explicit viewBox to prevent scaling issues */}
                           <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                              <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                              <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={339} strokeDashoffset={339 - (339 * (result.matchScore || 0)) / 100} className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-out" strokeLinecap="round" />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center flex-col">
                              <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">{result.matchScore}%</span>
                           </div>
                        </div>
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 px-4 py-1.5 rounded-full">
                           Confidence
                        </p>
                     </div>
                  </div>

                  {/* Summary Column */}
                  <div className="lg:col-span-3 space-y-3 flex flex-col">
                     <div className="flex justify-between items-center h-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tailored Executive Summary</h3>
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50" onClick={() => copyToClipboard(result.tailoredSummary)}>
                           <Copy className="w-4 h-4" /> Copy Text
                        </Button>
                     </div>
                     <div className="p-6 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl text-base leading-relaxed text-gray-800 dark:text-gray-200 flex-1 min-h-[220px] shadow-sm">
                        {result.tailoredSummary}
                     </div>
                  </div>
               </div>

               {/* Keywords & Gaps */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" /> Keywords to Add
                     </h3>
                     <div className="flex flex-wrap gap-2 p-5 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                        {result.missingKeywords.slice(0, 10).map((kw: string, i: number) => (
                           <div key={i} className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-medium rounded-full border border-yellow-200 dark:border-yellow-800">
                              + {kw}
                           </div>
                        ))}
                     </div>
                  </div>

                  {result.skillGaps && result.skillGaps.length > 0 && (
                     <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-red-500" /> Skills to Learn
                        </h3>
                         <ul className="p-5 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                           {result.skillGaps.map((gap: string, i: number) => (
                              <li key={i} className="pl-2">{gap}</li>
                           ))}
                        </ul>
                     </div>
                  )}
               </div>

               {/* Suggested Rewrites */}
               <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Suggested Point Rewrites</h3>
                  {result.suggestedRewrites && result.suggestedRewrites.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                       {result.suggestedRewrites.map((item: any, i: number) => (
                          <div key={i} className="bg-white dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row">
                             {/* Original */}
                             <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Original</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-through decoration-red-400/30 leading-relaxed">
                                   {item.original}
                                </p>
                             </div>
                             {/* Rewritten */}
                             <div className="flex-[1.2] p-5 bg-green-50/30 dark:bg-green-900/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                                       <Check className="w-3 h-3" /> Better Match
                                    </span>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs text-green-700 hover:text-green-800 hover:bg-green-100" onClick={() => copyToClipboard(item.rewritten)}>
                                       <Copy className="w-3 h-3 mr-1" /> Copy
                                    </Button>
                                </div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                   {item.rewritten}
                                </p>
                             </div>
                          </div>
                       ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Check className="w-8 h-8 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Your resume points are already quite strong!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Or the match score is too low to suggest meaningful rewrites.</p>
                    </div>
                  )}
               </div>

               <div className="flex justify-end pt-4">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setResult(null)}>
                     Analyze Another Job
                  </Button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

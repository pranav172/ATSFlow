'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { MessageSquare, Loader2, Copy, Check, X, Sparkles } from 'lucide-react';

interface InterviewPrepModalProps {
  jobDescription?: string;
  resumeContext?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewPrepModal({ jobDescription = '', resumeContext, isOpen, onClose }: InterviewPrepModalProps) {
  const [jd, setJd] = useState(jobDescription);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQuestions = async () => {
    if (jd.length < 50) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, resumeContext }),
      });

      const data = await response.json();
      
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(questions.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Interview Prep
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {questions.length === 0 ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Paste Job Description</label>
                <Textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">{jd.length} chars • min 50</p>
              </div>
              
              <Button
                onClick={generateQuestions}
                disabled={isGenerating || jd.length < 50}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Interview Questions
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Likely Interview Questions
                </h3>
                <Button variant="outline" size="sm" onClick={copyAll} className="gap-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy All'}
                </Button>
              </div>
              
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{q}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" onClick={() => setQuestions([])} className="w-full">
                Try Different JD
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

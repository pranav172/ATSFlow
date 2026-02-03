'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { MessageCircle, Loader2, ArrowLeft, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Question {
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  tip: string;
  sampleAnswer?: string;
}

export default function InterviewPrepPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (resumeText.length < 50) {
      addToast({ title: 'Resume too short', description: 'Please paste your resume text', variant: 'danger' });
      return;
    }

    setIsGenerating(true);
    setQuestions([]);

    try {
      const response = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();
      
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      addToast({ 
        title: 'Generation failed', 
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'danger' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'technical': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'situational': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-500">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Interview Prep AI</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate likely interview questions based on your resume and target job
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Job Description (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description for tailored questions..."
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || resumeText.length < 50}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <HelpCircle className="w-5 h-5 mr-2" />
                Generate Interview Questions
              </>
            )}
          </Button>
        </div>

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              {questions.length} Interview Questions
            </h2>
            
            {questions.map((q, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(q.type)}`}>
                          {q.type}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{q.question}</p>
                    </div>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  {expandedIndex === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in fade-in duration-200">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>💡 Tip:</strong> {q.tip}
                        </p>
                      </div>
                      {q.sampleAnswer && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Sample Answer:</strong> {q.sampleAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

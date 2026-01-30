'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { ResumeAnalysis } from '@/lib/ai/schema';
import { Button } from '@/components/ui/Button';

export default function UploadPage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUploadComplete = async (resumeId: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ resumeId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error(error);
      // You might want to show a toast here
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        {/* Simple CSS Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg font-medium animate-pulse text-text-primary dark:text-dark-text-primary">
            Analyzing your resume with AI...
        </p>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            This usually takes 10-20 seconds.
        </p>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">Analysis Results</h1>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={() => setAnalysis(null)} variant="secondary">Upload Another</Button>
                 </div>
            </div>
            <AnalysisResult analysis={analysis} resumeText="" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">
            Upload Your Resume
          </h1>
          <p className="text-text-secondary dark:text-dark-text-secondary text-lg max-w-2xl mx-auto">
            Our AI will analyze your resume against ATS standards and help you optimize it for your dream job.
          </p>
        </div>

        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
}

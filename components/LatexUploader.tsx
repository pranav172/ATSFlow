'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { FileText, Upload, Loader2, Wand2, Download, Check, Copy, ArrowRight } from 'lucide-react';

interface Suggestion {
  type: 'keyword' | 'formatting' | 'content';
  priority: 'high' | 'medium' | 'low';
  original: string;
  improved: string;
  reason: string;
  applied?: boolean;
}

interface AnalysisResult {
  success: boolean;
  originalText: string;
  sections: string[];
  suggestions: Suggestion[];
  overallScore: number;
  summary: string;
}

export function LatexUploader() {
  const [latexContent, setLatexContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  const { addToast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const text = await file.text();
    setLatexContent(text);
    addToast({
      title: 'File loaded!',
      description: `${file.name} ready for analysis`,
      variant: 'success',
    });
  }, [addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-tex': ['.tex'],
      'application/x-tex': ['.tex'],
      'text/plain': ['.tex'],
    },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  const handleAnalyze = async () => {
    if (latexContent.length < 100) {
      addToast({
        title: 'Content too short',
        description: 'Please paste more LaTeX content',
        variant: 'danger',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/latex/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latexContent, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      setAppliedSuggestions(new Set());
      
    } catch (error) {
      addToast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'danger',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (index: number) => {
    if (!result) return;
    
    const suggestion = result.suggestions[index];
    const newContent = latexContent.replace(suggestion.original, suggestion.improved);
    
    if (newContent !== latexContent) {
      setLatexContent(newContent);
      setAppliedSuggestions(prev => new Set([...prev, index]));
      addToast({
        title: 'Suggestion applied!',
        description: 'Your LaTeX has been updated',
        variant: 'success',
      });
    } else {
      addToast({
        title: 'Could not apply',
        description: 'Text not found - try applying manually',
        variant: 'danger',
      });
    }
  };

  const downloadLatex = () => {
    const blob = new Blob([latexContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'improved_resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLatex = () => {
    navigator.clipboard.writeText(latexContent);
    addToast({
      title: 'Copied!',
      description: 'LaTeX copied to clipboard',
      variant: 'success',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              LaTeX Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              {...getRootProps({
                className: cn(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
                  isDragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                )
              })}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDragActive ? 'Drop your .tex file here' : 'Drop .tex file or click to browse'}
              </p>
            </div>

            {/* Text Area */}
            <Textarea
              value={latexContent}
              onChange={(e) => setLatexContent(e.target.value)}
              placeholder="Or paste your LaTeX code here..."
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-gray-500">{latexContent.length} characters</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              Job Description (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job description for tailored suggestions..."
              className="min-h-[200px]"
            />
            <p className="text-xs text-gray-500">
              Adding a JD helps tailor keyword suggestions to the specific role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={isAnalyzing || latexContent.length < 100}
          className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Analyze & Improve
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">ATS Compatibility Score</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{result.summary}</p>
                </div>
                <div className={cn(
                  "text-5xl font-bold",
                  result.overallScore >= 80 ? 'text-green-600' : 
                  result.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {result.overallScore}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Improvement Suggestions</span>
                <Badge className="bg-purple-100 text-purple-700">
                  {result.suggestions.length} suggestions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-300",
                    appliedSuggestions.has(index)
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {suggestion.type}
                      </Badge>
                    </div>
                    {appliedSuggestions.has(index) ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="w-3 h-3 mr-1" /> Applied
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(index)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">Original</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{suggestion.original}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Improved</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{suggestion.improved}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> {suggestion.reason}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Download Section */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Download Improved Resume</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {appliedSuggestions.size} of {result.suggestions.length} suggestions applied
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={copyLatex} className="gap-2">
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                  <Button onClick={downloadLatex} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4" /> Download .tex
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

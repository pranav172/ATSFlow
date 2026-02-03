'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { FileText, Loader2, ArrowLeft, Copy, Check, Download, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function CoverLetterPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      addToast({ title: 'Invalid file', description: 'Please upload a PDF file', variant: 'danger' });
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.text) {
        setResumeText(data.text);
        addToast({ title: 'Resume uploaded!', description: 'Text extracted successfully', variant: 'success' });
      } else {
        throw new Error(data.error || 'Failed to parse PDF');
      }
    } catch (error) {
      addToast({ title: 'Upload failed', description: 'Could not extract text from PDF', variant: 'danger' });
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setResumeText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (resumeText.length < 50 || jobDescription.length < 50) {
      addToast({ title: 'Input too short', description: 'Resume and JD must be at least 50 characters', variant: 'danger' });
      return;
    }

    setIsGenerating(true);
    setCoverLetter('');

    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription, companyName }),
      });

      const data = await response.json();
      
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ title: 'Copied to clipboard!', variant: 'success' });
  };

  const downloadTxt = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover_letter_${companyName || 'company'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cover Letter Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create tailored cover letters that match your resume to the job description
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Your Resume
                {uploadedFile && (
                  <button onClick={clearFile} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Upload Button */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Extracting text...</span>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">{uploadedFile.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Upload className="w-5 h-5" />
                    <span>Upload PDF resume</span>
                  </div>
                )}
              </div>
              
              <div className="text-center text-xs text-gray-400">or paste text below</div>
              
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="min-h-[130px] resize-none"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description..."
                className="min-h-[180px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Company Name */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google, Microsoft..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || resumeText.length < 50 || jobDescription.length < 50}
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>

        {/* Output */}
        {coverLetter && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Cover Letter</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadTxt}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-200 leading-relaxed">
                {coverLetter}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

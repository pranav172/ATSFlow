'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Download, ArrowLeft, FileText, File, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Resume {
  id: string;
  originalFilename: string;
  atsScore: number | null;
  createdAt: string;
}

export default function ExportPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const { addToast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes');
      const data = await response.json();
      if (data.resumes) {
        setResumes(data.resumes);
        if (data.resumes.length > 0) {
          setSelectedResume(data.resumes[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedResume) {
      addToast({ title: 'No resume selected', variant: 'danger' });
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(`/api/export?resumeId=${selectedResume}&format=${exportFormat}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_optimized.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({ title: 'Export successful!', description: `Resume exported as ${exportFormat.toUpperCase()}`, variant: 'success' });
    } catch (error) {
      addToast({ title: 'Export failed', description: 'Please try again', variant: 'danger' });
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Best for applications' },
    { id: 'docx', label: 'DOCX', icon: File, description: 'Editable in Word' },
    { id: 'txt', label: 'TXT', icon: FileText, description: 'Plain text' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-500">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Export Resume</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Download your ATS-optimized resume in multiple formats
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            <p className="mt-2 text-gray-600">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">No resumes found. Upload one first!</p>
              <Link href="/upload">
                <Button>Upload Resume</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Resume Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => setSelectedResume(resume.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedResume === resume.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{resume.originalFilename}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {resume.atsScore && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                            {resume.atsScore}%
                          </span>
                        )}
                        {selectedResume === resume.id && (
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Format Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Export Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id as 'pdf' | 'docx' | 'txt')}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        exportFormat === format.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <format.icon className={`w-8 h-8 mx-auto mb-2 ${
                        exportFormat === format.id ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <p className="font-semibold text-gray-900 dark:text-white">{format.label}</p>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleExport}
                disabled={isExporting || !selectedResume}
                className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Export as {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

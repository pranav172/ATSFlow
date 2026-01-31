'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/Card';

import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FileUploadProps {
  onUploadComplete?: (resumeId: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { addToast } = useToast();
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      addToast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
        variant: 'danger',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      addToast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'danger',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);

      addToast({
        title: 'Upload successful!',
        description: 'Your resume has been uploaded and parsed.',
        variant: 'success',
      });

      if (onUploadComplete) {
        onUploadComplete(data.resumeId);
      } else {
         // Default behavior if no callback
         router.refresh();
      }

    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'danger',
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [addToast, onUploadComplete, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-8">
        <div
          {...getRootProps({
            className: cn(
              'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center gap-4 min-h-[200px]',
              isDragActive
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-border dark:border-dark-border hover:border-primary/50 dark:hover:border-primary/50 hover:bg-surface dark:hover:bg-dark-surface',
              isUploading && 'pointer-events-none opacity-50'
            )
          })}
        >
          <input {...getInputProps()} />
          
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <p className="text-lg font-medium text-text-primary dark:text-dark-text-primary">
              {isDragActive ? 'Drop the PDF here' : 'Upload your Resume'}
            </p>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
              Drag & drop or click to browse
            </p>
          </div>

          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-2">
            PDF only, max 5MB
          </p>
        </div>

        {isUploading && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-primary dark:text-dark-text-primary">Uploading & Parsing...</span>
              <span className="text-text-secondary dark:text-dark-text-secondary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

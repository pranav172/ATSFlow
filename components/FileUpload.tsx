'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/components/ui/Toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface UploadState {
  status: 'idle' | 'validating' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  fileName?: string;
}

export function FileUpload() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });
  const { addToast } = useToast();

  const validateFile = (file: File): string | null => {
    // File size check
    if (file.size > MAX_FILE_SIZE) {
      return 'FILE_TOO_LARGE';
    }

    // MIME type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'INVALID_TYPE';
    }

    // Filename sanitization
    const filename = file.name;
    if (filename.length > 100) {
      return 'FILENAME_TOO_LONG';
    }

    // Check for path traversal
    if (filename.includes('../') || filename.includes('..\\\\')) {
      return 'INVALID_FILENAME';
    }

    return null;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadState({ status: 'validating', progress: 0, fileName: file.name });

      // Client-side validation
      const validationError = validateFile(file);
      if (validationError) {
        const errorMessages: Record<string, string> = {
          FILE_TOO_LARGE:
            'File too large (max 5MB). Try compressing your PDF or removing images.',
          INVALID_TYPE:
            'We only accept PDF and DOCX files. Convert your file and try again.',
          FILENAME_TOO_LONG: 'Filename too long. Please use a shorter name (max 100 characters).',
          INVALID_FILENAME: 'Invalid filename. Please remove special characters.',
        };

        setUploadState({
          status: 'error',
          progress: 0,
          error: errorMessages[validationError],
        });

        addToast({
          title: 'Upload Failed',
          description: errorMessages[validationError],
          variant: 'danger',
        });
        return;
      }

      // Upload file to API
      try {
        setUploadState({ status: 'uploading', progress: 0, fileName: file.name });

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 90); // Reserve 10% for processing
            setUploadState((prev) => ({ ...prev, progress: percentComplete }));
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            
            setUploadState({ status: 'complete', progress: 100, fileName: file.name });

            addToast({
              title: 'Success!',
              description: 'Resume uploaded and parsed successfully',
              variant: 'success',
            });

            // Navigate to resume page after brief delay
            setTimeout(() => {
              router.push(`/resumes/${response.resumeId}`);
            }, 1500);
          } else {
            // Handle error response
            let errorMessage = 'Upload failed. Please try again.';
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              // Use default error message
            }

            setUploadState({
              status: 'error',
              progress: 0,
              error: errorMessage,
            });

            addToast({
              title: 'Upload Failed',
              description: errorMessage,
              variant: 'danger',
            });
          }
        });

        // Handle network errors
        xhr.addEventListener('error', () => {
          setUploadState({
            status: 'error',
            progress: 0,
            error: 'Network error. Please check your connection.',
          });

          addToast({
            title: 'Upload Failed',
            description: 'Network error. Please try again.',
            variant: 'danger',
          });
        });

        // Start upload
        xhr.open('POST', '/api/upload');
        xhr.send(formData);

        // Show processing state while server parses
        xhr.upload.addEventListener('load', () => {
          setUploadState({ status: 'processing', progress: 95, fileName: file.name });
        });
      } catch (error) {
        setUploadState({
          status: 'error',
          progress: 0,
          error: 'Upload failed. Please try again.',
        });

        addToast({
          title: 'Upload Failed',
          description: 'Something went wrong. Please try again.',
          variant: 'danger',
        });
      }
    },
    [addToast, router]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const resetUpload = () => {
    setUploadState({ status: 'idle', progress: 0 });
  };

  // Idle or Drag Active State
  if (uploadState.status === 'idle' || isDragActive) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-150 cursor-pointer',
          isDragActive && !isDragReject && 'border-primary bg-primary-light scale-[1.01]',
          isDragReject && 'border-danger bg-red-50',
          !isDragActive && 'border-border bg-white hover:border-primary hover:bg-primary-light/30'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <svg
              className={cn(
                'w-16 h-16',
                isDragActive && !isDragReject ? 'text-primary' : 'text-text-muted'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Text */}
          {isDragActive && !isDragReject ? (
            <div>
              <p className="text-lg font-semibold text-primary">Drop here</p>
            </div>
          ) : isDragReject ? (
            <div>
              <p className="text-lg font-semibold text-danger">Invalid file type</p>
              <p className="text-sm text-text-secondary mt-1">
                Only PDF and DOCX files are accepted
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-text-primary">
                Drop your resume here
              </p>
              <p className="text-sm text-text-secondary mt-2">
                PDF or DOCX up to 5MB
              </p>
              <p className="text-xs text-text-muted mt-4">or click to browse</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Validating State
  if (uploadState.status === 'validating') {
    return (
      <div className="border-2 border-primary bg-primary-light rounded-xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <svg
            className="animate-spin h-12 w-12 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-text-primary">
          Checking file security...
        </p>
      </div>
    );
  }

  // Uploading State
  if (uploadState.status === 'uploading') {
    return (
      <div className="border-2 border-primary bg-white rounded-xl p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-lg font-semibold text-text-primary">
            Uploading {uploadState.fileName}
          </p>
          <Progress value={uploadState.progress} showLabel />
          {uploadState.progress < 50 && (
            <Button variant="ghost" size="sm" onClick={resetUpload}>
              ✕ Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Processing State
  if (uploadState.status === 'processing') {
    return (
      <div className="border-2 border-primary bg-white rounded-xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <svg
            className="animate-spin h-12 w-12 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-text-primary">Parsing resume...</p>
      </div>
    );
  }

  // Complete State
  if (uploadState.status === 'complete') {
    return (
      <div className="border-2 border-success bg-emerald-50 rounded-xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-success mb-4">Upload complete!</p>
        <Button onClick={resetUpload}>Upload Another</Button>
      </div>
    );
  }

  // Error State
  if (uploadState.status === 'error') {
    return (
      <div className="border-2 border-danger bg-red-50 rounded-xl p-12 text-center animate-shake">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-danger rounded-full mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-danger mb-2">Upload Failed</p>
        <p className="text-sm text-text-secondary mb-4">{uploadState.error}</p>
        <Button variant="danger" onClick={resetUpload}>
          Try Again
        </Button>
      </div>
    );
  }

  return null;
}

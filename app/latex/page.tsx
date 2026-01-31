import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LatexUploader } from '@/components/LatexUploader';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FileCode } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'LaTeX Resume Optimizer | ATSFlow',
  description: 'Upload your Overleaf/LaTeX resume and get AI-powered ATS optimization suggestions',
};

export default async function LatexPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                LaTeX Resume Optimizer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your Overleaf/LaTeX CV for ATS-friendly improvements
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl animate-in fade-in duration-500 delay-100">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>How it works:</strong> We parse your LaTeX code, analyze it for ATS compatibility, 
            and suggest minimal keyword/formatting tweaks. We <strong>never add</strong> skills or experience you don&apos;t have.
          </p>
        </div>

        {/* Main Content */}
        <LatexUploader />
      </div>
    </div>
  );
}

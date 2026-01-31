import { getResume } from '@/lib/actions/resume-actions';
import { AnalysisResult } from '@/components/AnalysisResult';
import { JDMatcher } from '@/components/JDMatcher';
import { ExportReportButton } from '@/components/ExportReportButton';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { id } = await params;

  try {
    const resume = await getResume(id);

    if (!resume) {
      notFound();
    }

    const analysisData = resume.atsAnalysis as any;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border dark:border-dark-border pb-6">
           <div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">
                {resume.originalFilename}
              </h1>
              <p className="text-text-secondary dark:text-dark-text-secondary mt-1">
                Analyzed on {new Date(resume.createdAt).toLocaleDateString()}
              </p>
           </div>
           
           <div className="flex gap-2">
              {resume.status === 'analyzed' && analysisData && (
                <ExportReportButton
                  resumeFilename={resume.originalFilename}
                  atsScore={resume.atsScore || analysisData.score || 0}
                  grade={analysisData.grade || 'N/A'}
                  analysis={analysisData}
                />
              )}
              <Link href="/upload">
                <Button variant="outline">Analyze Another</Button>
              </Link>
           </div>
        </div>

        {resume.status === 'analyzed' && resume.atsAnalysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analysis - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <AnalysisResult analysis={resume.atsAnalysis as any} resumeText={resume.rawText || ''} />
            </div>
            
            {/* JD Matcher - Side panel on large screens */}
            <div className="lg:col-span-1">
              <JDMatcher resumeId={resume.id} />
            </div>
          </div>
        ) : (
           <div className="p-12 text-center border rounded-lg bg-surface/50 dark:bg-dark-surface/50">
              <h3 className="text-xl font-semibold mb-2">Analysis Pending or Failed</h3>
              <p className="text-muted-foreground mb-4">
                 Status: <span className="uppercase font-bold">{resume.status}</span>
              </p>
              {resume.errorMessage && (
                 <div className="max-w-md mx-auto p-4 bg-destructive/10 text-destructive rounded-md mb-4 text-sm font-mono">
                    {resume.errorMessage}
                 </div>
              )}
              <Link href="/upload">
                 <Button>Try Again</Button>
              </Link>
           </div>
        )}
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound(); 
  }
}


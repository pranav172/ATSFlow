import { getResumes } from '@/lib/actions/resume-actions';
import { ResumeCard } from '@/components/dashboard/ResumeCard';
import { Button } from '@/components/ui/Button';
import { Plus, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const resumes = await getResumes();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">My Resumes</h1>
           <p className="text-text-secondary dark:text-dark-text-secondary mt-1">
             Manage and optimize your resumes for different job applications.
           </p>
        </div>
        <Link href="/upload">
           <Button className="shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4 mr-2" /> New Upload
           </Button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 text-center p-8">
           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
           </div>
           <h3 className="text-xl font-semibold mb-2">No resumes uploaded yet</h3>
           <p className="text-muted-foreground max-w-sm mb-6">
             Upload your first resume to get an instant ATS analysis and improvement suggestions.
           </p>
           <Link href="/upload">
             <Button size="lg">Upload Resume</Button>
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {resumes.map((resume) => (
             <ResumeCard key={resume.id} resume={resume} />
           ))}
        </div>
      )}
    </div>
  );
}

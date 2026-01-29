import { getOrCreateUser } from '@/lib/services/user-sync';
import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ReportClient from './ReportClient';

interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const user = await getOrCreateUser();
  if (!user) {
    notFound();
  }

  const { id } = await params;

  // Fetch resume from database
  const [resume] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.id, id));

  if (!resume || resume.userId !== user.id) {
    notFound();
  }

  const atsAnalysis = resume.atsAnalysis as any;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-violet-50 dark:from-dark-background dark:via-dark-surface dark:to-purple-950/20 transition-colors duration-300">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ReportClient 
          initialData={{
            resume,
            atsScore: resume.atsScore || 0,
            atsAnalysis,
          }}
        />
      </main>
    </div>
  );
}

import { getOrCreateUser } from '@/lib/services/user-sync';
import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ATSAnalysisSection } from '@/components/ATSAnalysisSection';

interface ResumePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResumePage({ params }: ResumePageProps) {
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

  const structured = resume.structuredContent as any;
  const atsAnalysis = resume.atsAnalysis as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-violet-50 dark:from-dark-background dark:via-dark-surface dark:to-purple-950/20 transition-colors duration-300">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-text-primary dark:text-slate-100 mb-2">
              Resume Analysis
            </h1>
            <p className="text-lg text-text-secondary dark:text-slate-300">
              {resume.originalFilename}
            </p>
          </div>

          {/* ATS Analysis Section */}
          <ATSAnalysisSection 
            resumeId={resume.id}
            initialScore={resume.atsScore || undefined}
            initialAnalysis={atsAnalysis}
          />

          {/* Contact Info Card */}
          {structured?.contact && (
            <Card className="bg-white dark:bg-dark-surface">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {structured.contact.email && (
                    <div>
                      <span className="text-sm font-medium text-text-muted dark:text-slate-400">Email:</span>
                      <p className="text-text-primary dark:text-slate-100">{structured.contact.email}</p>
                    </div>
                  )}
                  {structured.contact.phone && (
                    <div>
                      <span className="text-sm font-medium text-text-muted dark:text-slate-400">Phone:</span>
                      <p className="text-text-primary dark:text-slate-100">{structured.contact.phone}</p>
                    </div>
                  )}
                  {structured.contact.location && (
                    <div>
                      <span className="text-sm font-medium text-text-muted dark:text-slate-400">Location:</span>
                      <p className="text-text-primary dark:text-slate-100">{structured.contact.location}</p>
                    </div>
                  )}
                  {structured.contact.linkedin && (
                    <div>
                      <span className="text-sm font-medium text-text-muted dark:text-slate-400">LinkedIn:</span>
                      <a 
                        href={structured.contact.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                  {structured.contact.github && (
                    <div>
                      <span className="text-sm font-medium text-text-muted dark:text-slate-400">GitHub:</span>
                      <a 
                        href={structured.contact.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                  {structured.contact.website && (
                    <div>
                      <span className="text-sm font-medium text-text-muted dark:text-slate-400">Website:</span>
                      <a 
                        href={structured.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Site
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Card */}
          {structured?.skills && structured.skills.length > 0 && (
            <Card className="bg-white dark:bg-dark-surface">
              <CardHeader>
                <CardTitle>Skills Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {structured.skills.slice(0, 20).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Text Preview */}
          <Card className="bg-white dark:bg-dark-surface">
            <CardHeader>
              <CardTitle>Extracted Text Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-text-secondary dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg max-h-96 overflow-auto">
                {resume.rawText}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

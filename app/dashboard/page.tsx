import { getOrCreateUser } from '@/lib/services/user-sync';
import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user's resumes
  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, user.id))
    .orderBy(desc(resumes.createdAt))
    .limit(5);

  // Calculate stats
  const totalResumes = userResumes.length;
  const averageScore = totalResumes > 0
    ? Math.round(userResumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / totalResumes)
    : 0;
  const recentAnalysis = userResumes[0]?.createdAt
    ? new Date(userResumes[0].createdAt).toLocaleDateString()
    : 'None';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-violet-50 dark:from-dark-background dark:via-dark-surface dark:to-purple-950/20 transition-colors duration-300">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-slate-100 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-base sm:text-lg text-text-secondary dark:text-slate-300">
              Here's your resume optimization dashboard
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-white dark:bg-dark-surface">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary dark:text-slate-400">Total Resumes</p>
                    <p className="text-3xl sm:text-4xl font-bold text-primary mt-2">{totalResumes}</p>
                  </div>
                  <div className="text-4xl">📄</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-dark-surface">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary dark:text-slate-400">Average Score</p>
                    <p className="text-3xl sm:text-4xl font-bold text-success mt-2">{averageScore}/100</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-dark-surface">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary dark:text-slate-400">Recent Analysis</p>
                    <p className="text-base sm:text-lg font-semibold text-text-primary dark:text-slate-100 mt-2">
                      {recentAnalysis}
                    </p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Resumes */}
          <Card className="bg-white dark:bg-dark-surface">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Recent Resumes</CardTitle>
                <Link href="/upload">
                  <button className="btn-primary w-full sm:w-auto">
                    Upload New Resume ⚡
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {userResumes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary dark:text-slate-400 mb-4">
                    No resumes analyzed yet
                  </p>
                  <Link href="/upload">
                    <button className="btn-secondary">
                      Upload Your First Resume
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userResumes.map((resume) => (
                    <Link
                      key={resume.id}
                      href={`/resumes/${resume.id}`}
                      className="block"
                    >
                      <div className="p-4 rounded-lg border border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-primary dark:text-slate-100 truncate">
                              {resume.fileName}
                            </p>
                            <p className="text-sm text-text-secondary dark:text-slate-400">
                              Analyzed {new Date(resume.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={resume.atsScore && resume.atsScore >= 80 ? 'success' : resume.atsScore && resume.atsScore >= 60 ? 'warning' : 'danger'}>
                              {resume.atsScore || 0}/100
                            </Badge>
                            <span className="text-primary dark:text-primary-light">→</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Showcase */}
          <Card className="bg-white dark:bg-dark-surface overflow-hidden">
            <CardHeader>
              <CardTitle>ATSFlow in Action 🚀</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-border dark:border-slate-700">
                <Image
                  src="/app-showcase.png"
                  alt="ATSFlow Comprehensive Analysis Report"
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <p className="text-sm text-text-secondary dark:text-slate-400 mt-4 text-center">
                Get comprehensive AI-powered analysis with job predictions, skill gaps, and career insights
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/upload">
              <Card className="bg-gradient-to-br from-primary to-primary-dark hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 text-center text-white">
                  <div className="text-4xl mb-3">📤</div>
                  <h3 className="font-semibold text-lg mb-2">Upload Resume</h3>
                  <p className="text-sm opacity-90">Analyze a new resume</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/showcase">
              <Card className="bg-gradient-to-br from-success to-success/80 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 text-center text-white">
                  <div className="text-4xl mb-3">🎨</div>
                  <h3 className="font-semibold text-lg mb-2">View Showcase</h3>
                  <p className="text-sm opacity-90">See example analyses</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

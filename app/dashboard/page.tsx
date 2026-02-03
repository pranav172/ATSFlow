import { getResumes } from '@/lib/actions/resume-actions';
import { ResumeCard } from '@/components/dashboard/ResumeCard';
import { AIInsightCard } from '@/components/AIInsightCard';
import { Button } from '@/components/ui/Button';
import { Upload, FileCode, History, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  let resumes: any[] = [];
  
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
       redirect('/');
    }

    resumes = await getResumes();
  } catch (error) {
    console.error("Dashboard Page Error:", error);
    if (error && typeof error === 'object' && 'digest' in error && (error as any).digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
    }
    resumes = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
           </h1>
           <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your resumes and optimize for ATS
           </p>
        </div>
      </div>

      {/* Quick Actions - Visual Icon Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/upload" className="group">
          <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Upload PDF</h3>
            <p className="text-purple-100 text-sm">Analyze resume</p>
          </div>
        </Link>

        <Link href="/latex" className="group">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">LaTeX CV</h3>
            <p className="text-blue-100 text-sm">Overleaf optimizer</p>
          </div>
        </Link>

        <a href="#resume-list" className="group">
          <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Recent</h3>
            <p className="text-emerald-100 text-sm">{resumes.length} resumes</p>
          </div>
        </a>

        <Link href="/ai-tools" className="group">
          <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">AI Tools</h3>
            <p className="text-amber-100 text-sm">Quick polish</p>
          </div>
        </Link>
      </div>

      {/* AI Insight + Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insight Card */}
        <div className="lg:col-span-1">
          <AIInsightCard />
        </div>

        {/* Stats or Empty State */}
        <div className="lg:col-span-2">
          {resumes.length > 0 ? (
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">{resumes.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resumes</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-3xl font-bold text-green-600">
                    {resumes.filter((r: any) => (r.atsScore || 0) >= 70).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Score</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round(resumes.reduce((acc: number, r: any) => acc + (r.atsScore || 0), 0) / (resumes.length || 1))}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No resumes yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Upload your first resume to get started</p>
              <Link href="/upload">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" /> Upload Resume
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Resume List */}
      {resumes.length > 0 && (
        <div id="resume-list">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Resumes</h2>
            <Link href="/upload">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> New
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {resumes.map((resume: any) => (
               <ResumeCard key={resume.id} resume={resume} />
             ))}
          </div>
        </div>
      )}
    </div>
  );
}

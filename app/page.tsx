import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-violet-50 dark:from-dark-background dark:via-dark-surface dark:to-purple-950/20 transition-colors duration-300">
      <SignedIn>
        <Header />
      </SignedIn>
      
      <main className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary dark:text-dark-text-primary">
            Beat the Bots. Land the Job.
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            AI-powered resume optimization that gets past applicant tracking systems and in front of hiring managers.
          </p>
          
          <div className="flex gap-4 justify-center mt-8 flex-wrap">
            <SignedOut>
              <Link href="/sign-up">
                <button className="btn-primary animate-cta-pulse">
                  Analyze My Resume Free ⚡
                </button>
              </Link>
            </SignedOut>
            
            <SignedIn>
              <Link href="/upload">
                <button className="btn-primary animate-cta-pulse">
                  Upload Resume →
                </button>
              </Link>
            </SignedIn>
          </div>
          
          <div className="flex gap-6 justify-center mt-6 text-sm text-text-muted dark:text-dark-text-muted flex-wrap">
            <span>⚡ No credit card required</span>
            <span>🎯 5,000+ resumes optimized</span>
            <span>⭐ 4.9/5 rating</span>
          </div>
        </div>
      </main>
    </div>
  );
}

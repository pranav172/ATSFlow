import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle, FileText, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { SmartNavbar } from '@/components/SmartNavbar';
import { SignedOut, SignedIn } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-purple-100 selection:text-purple-900 pt-16">
       <SmartNavbar />
       
       {/* Hero Section */}
       <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/40 via-white to-white dark:from-purple-900/20 dark:via-gray-950 dark:to-gray-950 -z-10" />
          
          <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-300 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Now with AI Job Tailoring</span>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Resumes that pass the <br className="hidden md:block"/>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400"> Applicant Tracking System</span>
             </h1>
             
             <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                Stop getting rejected by bots. Our AI analyzes your resume against job descriptions, identifying keywords and gaps to increase your interview chances by 3x.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <SignedOut>
                  <Link href="/sign-up">
                    <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-purple-900/20 transition-all hover:scale-105">
                       Optimize My Resume Free <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-purple-900/20 transition-all hover:scale-105">
                       Go into Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </SignedIn>
                
                <Link href="#how-it-works">
                   <Button variant="secondary" size="lg" className="h-14 px-8 text-lg rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent text-gray-900 dark:text-gray-100">
                      How it Works
                   </Button>
                </Link>
             </div>
             
             <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400 animate-in fade-in delay-500">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-green-500" /> No credit card required
                </div>
                <div className="flex items-center gap-2">
                   <CheckCircle className="w-4 h-4 text-blue-500" /> ATS-Friendly Parsing
                </div>
             </div>
          </div>
       </section>

       {/* Features Grid */}
       <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-6xl">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Everything you need to get hired</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Our suite of tools ensures your application stands out.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                   icon={<FileText className="w-8 h-8 text-blue-500" />}
                   title="ATS Compliance Score"
                   description="Get an instant score (0-100) based on how well your resume parses. We identify formatting issues that confuse ATS bots."
                />
                <FeatureCard 
                   icon={<TrendingUp className="w-8 h-8 text-green-500" />}
                   title="Keyword Gap Analysis"
                   description="Paste the Job Description and see exactly which hard skills and keywords you're missing compared to the requirements."
                />
                <FeatureCard 
                   icon={<Zap className="w-8 h-8 text-purple-500" />}
                   title="AI Content Tailoring"
                   description="Don't just see the errors—fix them. Our AI rewrites your bullet points to be punchy, impactful, and perfectly aligned."
                />
             </div>
          </div>
       </section>
       
       {/* How It Works */}
       <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 max-w-5xl">
             <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Three steps to your dream job</h2>
             </div>
             
             <div className="space-y-12">
                <Step 
                   number="01" 
                   title="Upload Your Resume" 
                   desc="Drag and drop your PDF resume. We parse it securely using advanced text extraction algorithms."
                   align="left"
                   imageSrc="/images/step1-upload.png"
                />
                <Step 
                   number="02" 
                   title="Paste the Job Description" 
                   desc="Tell us what role you're applying for. We compare your experience directly against the JD."
                   align="right"
                   imageSrc="/images/step2-analysis.png"
                />
                <Step 
                   number="03" 
                   title="Optimize & Apply" 
                   desc="Use our AI suggestions to fill gaps and improve phrasing. Download and apply with confidence."
                   align="left"
                   imageSrc="/images/step3-optimize.png"
                />
             </div>
          </div>
       </section>

       {/* CTA Section */}
       <section className="py-24 bg-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
             <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to land more interviews?</h2>
             <p className="text-xl text-purple-100 mb-10">Join thousands of job seekers optimizing their applications with AI.</p>
             <SignedOut>
                <Link href="/sign-up">
                   <Button size="lg" className="h-16 px-10 text-xl font-semibold bg-white text-purple-900 hover:bg-gray-100 hover:scale-105 transition-all rounded-full shadow-2xl">
                      Get Started for Free
                   </Button>
                </Link>
             </SignedOut>
             <SignedIn>
                <Link href="/upload">
                   <Button size="lg" className="h-16 px-10 text-xl font-semibold bg-white text-purple-900 hover:bg-gray-100 hover:scale-105 transition-all rounded-full shadow-2xl">
                      Optimize New Resume
                   </Button>
                </Link>
             </SignedIn>
          </div>
       </section>

       {/* Simple Footer */}
       <footer className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
             <p className="mb-4 font-semibold text-gray-900 dark:text-white">ATSFlow</p>
             <p className="mb-8 text-sm">Empowering job seekers with AI intelligence.</p>
             <div className="text-sm">
                &copy; {new Date().getFullYear()} ATSFlow. All rights reserved.
             </div>
          </div>
       </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
   return (
      <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
         <div className="mb-4 bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-xl flex items-center justify-center">
            {icon}
         </div>
         <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
         <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
         </p>
      </div>
   )
}

function Step({ number, title, desc, align, imageSrc }: { number: string, title: string, desc: string, align: 'left' | 'right', imageSrc: string }) {
   return (
      <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
         <div className="flex-1 text-center md:text-left">
            <span className="text-6xl font-black text-gray-100 dark:text-gray-800 mb-4 block leading-none select-none">{number}</span>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto md:mx-0">
               {desc}
            </p>
         </div>
         <div className="flex-1 w-full max-w-md aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner flex items-center justify-center relative overflow-hidden group">
            <Image 
                src={imageSrc} 
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
            />
         </div>
      </div>
   )
}

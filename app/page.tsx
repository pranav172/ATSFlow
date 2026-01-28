export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-white">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-text-primary">
          ATSFlow
        </h1>
        <p className="text-2xl text-text-secondary">
          Beat the Bots. Land the Job.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button className="btn-primary animate-cta-pulse">
            Analyze My Resume Free ⚡
          </button>
        </div>
        <p className="text-sm text-text-muted mt-4">
          🎯 No credit card required • ⭐ 5,000+ resumes optimized
        </p>
      </div>
    </main>
  );
}

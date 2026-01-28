import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function UploadPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Fetch user's credits from database
  const creditsRemaining = 1;
  const subscriptionTier: 'free' | 'pro' | 'coach' = 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Upload Your Resume
            </h1>
            <p className="text-lg text-text-secondary">
              Get your ATS score and optimization suggestions in seconds ⚡
            </p>
          </div>

          {/* Credits Display */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Credits</CardTitle>
                  <CardDescription>
                    {subscriptionTier === 'free'
                      ? 'Free tier - 1 credit total (never resets)'
                      : 'Pro tier - Unlimited optimizations'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {subscriptionTier === 'pro' ? (
                    <Badge variant="pro">Pro ⚡ Unlimited</Badge>
                  ) : (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {creditsRemaining}
                      </div>
                      <div className="text-xs text-text-muted">remaining</div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Upload Widget */}
          <FileUpload />

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Instant Analysis
                </h3>
                <p className="text-sm text-text-secondary">
                  ATS score in under 5 seconds
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-text-primary mb-1">
                  Precise Fixes
                </h3>
                <p className="text-sm text-text-secondary">
                  Actionable improvements for every section
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-text-primary mb-1">
                  100% Private
                </h3>
                <p className="text-sm text-text-secondary">
                  Your data is encrypted and never shared
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Acceptable Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <div>
                  <strong className="text-text-primary">PDF</strong> - Preferred format,
                  must be text-based (not scanned images)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <div>
                  <strong className="text-text-primary">DOCX</strong> - Microsoft Word
                  2007+ (.docx only, not .doc)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-danger">✗</span>
                <div className="opacity-50">
                  <strong>Scanned PDFs</strong> - Must contain actual text, not images
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-danger">✗</span>
                <div className="opacity-50">
                  <strong>Password-protected files</strong> - Remove password before
                  uploading
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

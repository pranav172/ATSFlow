'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress, CircularProgress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            UI Component Showcase
          </h1>
          <p className="text-text-secondary">
            ATSFlow Design System - Phase 4 Complete ✅
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>All button variants with states</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 2000);
              }}
            >
              {isLoading ? 'Loading...' : 'Test Loading'}
            </Button>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status and score indicators</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Excellent (80+)</Badge>
            <Badge variant="warning">Good (60-79)</Badge>
            <Badge variant="danger">Needs Work (&lt;60)</Badge>
            <Badge variant="info">Processing</Badge>
            <Badge variant="pro">Pro ⚡</Badge>
          </CardContent>
        </Card>

        {/* Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
            <CardDescription>Upload progress and ATS scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-text-secondary mb-2">Linear Progress</p>
              <Progress value={45} showLabel />
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-4">Circular Progress (ATS Scores)</p>
              <div className="flex gap-8 flex-wrap">
                <CircularProgress value={92} label="/100" />
                <CircularProgress value={75} label="/100" />
                <CircularProgress value={45} label="/100" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>Content containers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Resume Analysis</CardTitle>
                  <CardDescription>Ready to optimize</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">
                    Your resume has been analyzed. ATS score: 75/100
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">View Details</Button>
                </CardFooter>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Free tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">1 credit remaining</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="primary">
                    Upgrade to Pro
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Modal & Toast */}
        <Card>
          <CardHeader>
            <CardTitle>Modal & Toast</CardTitle>
            <CardDescription>Overlays and notifications</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Button
              variant="secondary"
              onClick={() =>
                addToast({
                  title: 'Success!',
                  description: 'Resume uploaded successfully',
                  variant: 'success',
                })
              }
            >
              Success Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                addToast({
                  title: 'Warning',
                  description: 'File size limit approaching',
                  variant: 'warning',
                })
              }
            >
              Warning Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                addToast({
                  title: 'Error',
                  description: 'File validation failed',
                  variant: 'danger',
                })
              }
            >
              Error Toast
            </Button>
          </CardContent>
        </Card>

        {/* Modal Component */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Upgrade to Pro"
          description="Unlock unlimited optimizations and advanced features"
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              Get unlimited resume optimizations, LinkedIn profile optimization, and
              priority AI processing.
            </p>
            <div className="flex gap-4">
              <Button variant="primary">Upgrade Now - $99/mo</Button>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

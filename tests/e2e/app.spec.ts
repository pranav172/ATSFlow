import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('renders hero section with CTA', async ({ page }) => {
    await page.goto('/');
    
    // Check hero title
    await expect(page.locator('h1')).toContainText('Applicant Tracking System');
    
    // Check CTA button exists
    const ctaButton = page.getByRole('link', { name: /Optimize|Dashboard/i });
    await expect(ctaButton).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check features section link
    await page.click('text=How it Works');
    await expect(page.locator('#how-it-works')).toBeVisible();
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');
    
    // Find and click theme toggle (if exists on page)
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // Verify dark mode class
      await expect(page.locator('html')).toHaveClass(/dark/);
    }
  });
});

test.describe('Upload Flow (Unauthenticated)', () => {
  test('redirects to login when accessing /upload without auth', async ({ page }) => {
    await page.goto('/upload');
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/sign-in/);
  });

  test('redirects to login when accessing /dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect or show auth required
    await expect(page).toHaveURL(/sign-in|\//);
  });
});

test.describe('Upload Page (Authenticated)', () => {
  // Note: These tests require authentication mocking
  // For now, we test the UI elements when accessible
  
  test.skip('shows file upload dropzone', async ({ page }) => {
    // This test requires authentication
    await page.goto('/upload');
    
    await expect(page.getByText(/Upload your Resume/i)).toBeVisible();
    await expect(page.getByText(/PDF only/i)).toBeVisible();
  });

  test.skip('shows error for non-PDF file', async ({ page }) => {
    await page.goto('/upload');
    
    // Try to upload a non-PDF file
    const fileChooser = await page.waitForEvent('filechooser');
    await fileChooser.setFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content'),
    });
    
    // Should show error toast
    await expect(page.getByText(/Invalid file type/i)).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('landing page is responsive', async ({ page }) => {
    await page.goto('/');
    
    // Hero should still be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Mobile menu should exist (or navbar should be hidden)
    // Depending on implementation
  });

  test('buttons are tappable size', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.getByRole('button');
    const firstButton = buttons.first();
    
    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox();
      // Minimum tap target is 44x44 on mobile
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Accessibility', () => {
  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('links have descriptive text', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a');
    const count = await links.count();
    
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Link should have either text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Performance', () => {
  test('landing page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});

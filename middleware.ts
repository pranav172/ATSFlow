import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/upload(.*)',
  '/resumes(.*)',
  '/settings(.*)',
  '/api/upload(.*)',
  '/api/optimize(.*)',
]);

// Actually, createRouteMatcher defines what IS protected.
// So if I don't add /debug, it is public?
// Default clerkMiddleware protects all routes unless specified?
// No, the code says `if (isProtectedRoute(req)) await auth.protect()`.
// So /debug should be public by default.

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

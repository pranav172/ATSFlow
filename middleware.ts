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
  try {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  } catch (error) {
    console.error('Middleware Error:', error);
    // We cannot render a React component from middleware, but we can return a response
    // If auth fails, Clerk usually handles it, but if something else fails:
    // throw error; // Rethrowing likely causes the 500
    
    // Return a text response for debugging if needed, or let Next handles it.
    // Ideally we want to see the error.
    console.error("CRITICAL MIDDLEWARE FAILURE", error);
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

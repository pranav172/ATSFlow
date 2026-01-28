import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Get or create a user record in the database from Clerk user data
 * This ensures the user exists in our database before we reference it
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    throw new Error('User not authenticated');
  }

  // Check if user already exists in our database
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // Create new user record
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      avatarUrl: clerkUser.imageUrl || null,
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
      creditsRemaining: 1,
      lastLoginAt: new Date(),
    })
    .returning();

  return newUser;
}

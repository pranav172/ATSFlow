'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Ensures a user exists in the local database.
 * 
 * This is a fallback mechanism for when the Clerk webhook might have:
 * 1. Failed to fire
 * 2. Failed to process
 * 3. Been set up after users were created
 * 
 * Call this at the start of any authenticated request that needs
 * to work with the local database.
 * 
 * @param clerkUserId - The Clerk user ID from auth()
 * @returns The internal database user record, or null if sync failed
 */
export async function ensureUserExists(clerkUserId: string): Promise<{
  id: string;
  clerkId: string;
  email: string;
} | null> {
  try {
    // First, try to find existing user
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
      columns: {
        id: true,
        clerkId: true,
        email: true,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    // User doesn't exist - fetch from Clerk and create
    console.log('User not in DB, fetching from Clerk:', clerkUserId);
    
    const clerkUser = await currentUser();
    
    if (!clerkUser || clerkUser.id !== clerkUserId) {
      console.error('Could not fetch Clerk user or ID mismatch');
      return null;
    }

    // Get primary email
    const primaryEmail = clerkUser.emailAddresses?.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!primaryEmail) {
      console.error('No email found for Clerk user');
      return null;
    }

    // Check if a user with this email already exists (email is unique)
    const existingByEmail = await db.query.users.findFirst({
      where: eq(users.email, primaryEmail),
    });

    if (existingByEmail) {
      // Update the clerkId if it's different (user might have been created differently)
      if (existingByEmail.clerkId !== clerkUserId) {
        await db.update(users)
          .set({ clerkId: clerkUserId, updatedAt: new Date() })
          .where(eq(users.id, existingByEmail.id));
      }
      return existingByEmail;
    }

    // Create new user - combine firstName and lastName into fullName
    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(' ') || null;
    
    const [newUser] = await db.insert(users).values({
      clerkId: clerkUserId,
      email: primaryEmail,
      fullName,
      avatarUrl: clerkUser.imageUrl || null,
    }).returning({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
    });

    console.log('Created user on-the-fly:', newUser.id);
    return newUser;

  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return null;
  }
}

/**
 * Simple helper to get internal user ID from Clerk ID
 * Returns null if user doesn't exist (use ensureUserExists for auto-creation)
 */
export async function getInternalUserId(clerkUserId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUserId),
    columns: { id: true },
  });
  
  return user?.id || null;
}

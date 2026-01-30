'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { resumes, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getResumes() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // 1. Resolve Clerk ID to Internal User ID
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser) {
    return []; // User hasn't uploaded anything yet or doesn't exist in our DB
  }

  // 2. Fetch Resumes
  const userResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, dbUser.id))
    .orderBy(desc(resumes.createdAt));

  return userResumes;
}

export async function getResume(resumeId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (!dbUser) throw new Error('User not found');

    const resume = await db.query.resumes.findFirst({
        where: and(
            eq(resumes.id, resumeId),
            eq(resumes.userId, dbUser.id)
        ),
    });

    return resume;
}

export async function deleteResume(resumeId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser) throw new Error('User not found');

  // Verify ownership and delete
  await db
    .delete(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, dbUser.id)));

  revalidatePath('/dashboard');
  return { success: true };
}

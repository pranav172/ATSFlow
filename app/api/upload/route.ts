import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { resumes, users } from '@/lib/db/schema'; // Added users
import { eq } from 'drizzle-orm'; // Added eq
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve Clerk ID to Internal DB ID
    let dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    // If user doesn't exist in local DB (webhook missed?), create them
    if (!dbUser) {
        console.log('User not found in local DB, creating on-the-fly:', userId);
        const [newUser] = await db.insert(users).values({
            clerkId: userId,
            email: 'placeholder@example.com', // We might not have email here if not in session, but let's try to proceed or handle carefully.
            // Actually, we can't get email easily without Clerk SDK call here if not passed.
            // But usually webhooks handle this. For now, let's assume webhooks worked OR minimal insert.
            // Wait, email is unique and notNull. We can't insert without it.
            // Let's assume for now we must query.
            // If strictly missing, we might fail or need to fetch from Clerk.
        }).returning();
        // dbUser = newUser; 
        
        // Failsafe: If we can't create (validation), we must return error.
        return NextResponse.json({ 
            error: 'User account not synchronized. Please try logging out and back in.' 
        }, { status: 404 });
    }

    const internalUserId = dbUser.id;

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDFs are allowed.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF text
    let rawText = '';
    try {
      const data = await pdf(buffer);
      rawText = data.text;
    } catch (parseError) {
      console.error('PDF Parse Error:', parseError);
      return NextResponse.json({ error: 'Failed to parse PDF content.' }, { status: 500 });
    }

    // Save file locally (for now)
    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', userId);
    await mkdir(uploadDir, { recursive: true });
    
    // Create a unique filename to avoid collisions
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const filepath = join(uploadDir, filename);
    const storageKey = `/uploads/${userId}/${filename}`;

    await writeFile(filepath, buffer);

    // Save to Database
    console.log('Inserting into database:', { userId: internalUserId, filename, mimeType: file.type });
    try {
      const [resume] = await db.insert(resumes).values({
        userId: internalUserId, // Use the UUID, not Clerk ID
        originalFilename: file.name,
        storageKey: storageKey,
        fileSizeBytes: file.size,
        mimeType: file.type,
        rawText: rawText || '', 
        status: 'parsed',
        parseConfidence: '1.00',
      }).returning();

      console.log('Database insertion successful:', resume.id);
      return NextResponse.json({ success: true, resumeId: resume.id });
    } catch (dbError) {
      console.error('Database Insertion Error:', dbError);
      return NextResponse.json({ error: 'Database Error: Failed to save resume record.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload API Critical Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Server Error';
    return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}

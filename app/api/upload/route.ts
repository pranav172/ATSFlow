import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';
import pdf from 'pdf-parse';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit';
import { ensureUserExists } from '@/lib/actions/user-sync';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(userId, RATE_LIMITS.upload);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Ensure user exists in local DB (handles webhook sync issues)
    const dbUser = await ensureUserExists(userId);
    
    if (!dbUser) {
      return NextResponse.json({ 
        error: 'Could not sync user account. Please try logging out and back in.' 
      }, { status: 500 });
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

    // Generate a storage key (for reference, not actual file storage)
    // On Vercel, we can't write files - store text directly in DB
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `db://${userId}/${timestamp}-${sanitizedFilename}`;

    // Save to Database (text content stored directly)
    console.log('Inserting into database:', { userId: internalUserId, filename: file.name });
    try {
      const [resume] = await db.insert(resumes).values({
        userId: internalUserId,
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

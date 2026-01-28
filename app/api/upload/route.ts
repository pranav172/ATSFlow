import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/services/parse-resume';
import { getOrCreateUser } from '@/lib/services/user-sync';
import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    // Get or create user in database
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'FILE_TOO_LARGE', message: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'INVALID_TYPE', message: 'Only PDF and DOCX files are accepted' },
        { status: 400 }
      );
    }

    // Parse the resume
    console.log(`Parsing resume: ${file.name} (${file.type})`);
    const parseResult = await parseResume(file);

    if (!parseResult.success) {
      console.error('Resume parsing failed:', parseResult.error);
      
      // Map parsing errors to user-friendly messages
      const errorMessages: Record<string, string> = {
        INVALID_TYPE: 'Invalid file type',
        NO_TEXT_FOUND: 'Could not extract text from file. Is it a scanned PDF?',
        PARSING_FAILED: 'Failed to parse resume. Please try a different file.',
      };

      return NextResponse.json(
        {
          error: parseResult.error,
          message: errorMessages[parseResult.error || 'PARSING_FAILED'],
        },
        { status: 400 }
      );
    }

    // Save to database
    const [resume] = await db
      .insert(resumes)
      .values({
        userId: user.id, // Use database user ID (UUID), not Clerk ID
        originalFilename: file.name,
        storageKey: `uploads/${user.id}/${Date.now()}-${file.name}`, // Temporary - will implement actual storage later
        mimeType: file.type,
        fileSizeBytes: file.size,
        rawText: parseResult.rawText,
        structuredContent: parseResult.structuredContent,
        status: 'parsed',
        // Default null values for fields that will be filled in Phase 7
        atsScore: null,
        atsAnalysis: null,
      })
      .returning();

    console.log(`Resume saved successfully: ID ${resume.id}`);

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      message: 'Resume uploaded and parsed successfully',
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

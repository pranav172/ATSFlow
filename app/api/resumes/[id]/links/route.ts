import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/services/user-sync';
import { db } from '@/lib/db';
import { resumes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { links } = await request.json();

    // Validate links
    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'Invalid links format' }, { status: 400 });
    }

    // Get existing resume
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id));

    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Update structured content with new links
    const structuredContent = resume.structuredContent as any;
    
    // Update contact links
    const contactLinks = links.filter((l: any) => l.type === 'contact');
    contactLinks.forEach((link: any) => {
      const label = link.label.toLowerCase();
      if (label.includes('linkedin')) {
        structuredContent.contact.linkedin = link.url;
      } else if (label.includes('github')) {
        structuredContent.contact.github = link.url;
      } else if (label.includes('portfolio') || label.includes('website')) {
        structuredContent.contact.website = link.url;
      }
    });

    // Store all links in a new field
    structuredContent.manualLinks = links;

    // Update database
    await db
      .update(resumes)
      .set({ structuredContent })
      .where(eq(resumes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving links:', error);
    return NextResponse.json(
      { error: 'Failed to save links' },
      { status: 500 }
    );
  }
}

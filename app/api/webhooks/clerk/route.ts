import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Clerk Webhook Handler
 * 
 * Handles user lifecycle events from Clerk:
 * - user.created: Create local user record
 * - user.updated: Update user details
 * - user.deleted: Soft delete or cleanup
 * 
 * Setup in Clerk Dashboard:
 * 1. Go to Webhooks settings
 * 2. Add endpoint: https://yourdomain.com/api/webhooks/clerk
 * 3. Select events: user.created, user.updated, user.deleted
 * 4. Copy the signing secret to CLERK_WEBHOOK_SECRET env var
 */

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the webhook secret from environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not set');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Received Clerk webhook: ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        
        const primaryEmail = email_addresses?.[0]?.email_address;
        
        if (!primaryEmail) {
          console.error('No email found for user:', id);
          return new Response('No email in user data', { status: 400 });
        }

        // Check if user already exists (edge case: webhook retry)
        const existingUser = await db.query.users.findFirst({
          where: eq(users.clerkId, id),
        });

        if (existingUser) {
          console.log('User already exists, skipping creation:', id);
          return new Response('User already exists', { status: 200 });
        }

        // Create new user
        const fullName = [first_name, last_name].filter(Boolean).join(' ') || null;
        
        await db.insert(users).values({
          clerkId: id,
          email: primaryEmail,
          fullName,
          avatarUrl: image_url || null,
        });

        console.log('Created user in database:', id);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        
        const primaryEmail = email_addresses?.[0]?.email_address;

        // Update user
        const fullName = [first_name, last_name].filter(Boolean).join(' ') || null;
        
        await db.update(users)
          .set({
            email: primaryEmail || undefined,
            fullName,
            avatarUrl: image_url || null,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, id));

        console.log('Updated user in database:', id);
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;
        
        if (!id) {
          console.error('No user ID in delete event');
          return new Response('No user ID', { status: 400 });
        }

        // Soft delete: just log for now
        // In production, you might want to:
        // 1. Mark user as deleted
        // 2. Schedule data cleanup
        // 3. Anonymize personal data
        
        console.log('User deleted in Clerk:', id);
        
        // For now, we'll delete the user record
        // This will cascade delete resumes due to foreign key constraint
        await db.delete(users).where(eq(users.clerkId, id));
        
        console.log('Deleted user from database:', id);
        break;
      }

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    return new Response('Webhook processed', { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal error processing webhook', { status: 500 });
  }
}

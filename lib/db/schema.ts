import { pgTable, uuid, text, varchar, integer, timestamp, decimal, boolean, jsonb, pgEnum, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'coach']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'inactive']);
export const resumeStatusEnum = pgEnum('resume_status', [
  'uploaded', 
  'parsing', 
  'parsed', 
  'analyzing', 
  'analyzed', 
  'optimizing', 
  'optimized', 
  'failed', 
  'quarantined'
]);
export const versionTypeEnum = pgEnum('version_type', [
  'original',
  'optimized_standard',
  'optimized_technical',
  'optimized_leadership',
  'tailored',
  'cover_letter'
]);
export const employmentTypeEnum = pgEnum('employment_type', ['full-time', 'contract', 'part-time']);
export const seniorityLevelEnum = pgEnum('seniority_level', ['junior', 'mid', 'senior', 'staff']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded', 'disputed']);
export const productSkuEnum = pgEnum('product_sku', [
  'one_time_optimization',
  'pro_monthly',
  'pro_yearly',
  'coach_package'
]);

// ============================================
// TABLES
// ============================================

// Users table - Synced with Clerk
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  
  // Subscription
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('inactive'),
  stripeCustomerId: text('stripe_customer_id'),
  
  // Credits
  creditsRemaining: integer('credits_remaining').default(1),
  creditsResetDate: timestamp('credits_reset_date'),
  
  // GDPR & Privacy
  marketingConsent: boolean('marketing_consent').default(false),
  marketingConsentAt: timestamp('marketing_consent_at'),
  dataProcessingConsent: boolean('data_processing_consent').default(true).notNull(),
  gdprExportRequestedAt: timestamp('gdpr_export_requested_at'),
  gdprDeletionRequestedAt: timestamp('gdpr_deletion_requested_at'),
  acceptedTermsAt: timestamp('accepted_terms_at').notNull().defaultNow(),
  
  // Security
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: index('users_clerk_id_idx').on(table.clerkId),
  emailIdx: index('users_email_idx').on(table.email),
}));

// Resumes table - Original uploads
export const resumes = pgTable('resumes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // File metadata
  originalFilename: varchar('original_filename', { length: 100 }).notNull(),
  storageKey: text('storage_key').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  mimeType: text('mime_type').notNull(),
  fileHash: text('file_hash'),
  
  // Parsed content
  rawText: text('raw_text'),
  structuredContent: jsonb('structured_content'),
  detectedLanguage: varchar('detected_language', { length: 10 }).default('en'),
  
  // ATS Analysis
  atsScore: integer('ats_score'),
  atsAnalysis: jsonb('ats_analysis'),
  parseConfidence: decimal('parse_confidence', { precision: 3, scale: 2 }),
  
  // Status
  status: resumeStatusEnum('status').default('uploaded').notNull(),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  
  // Retention
  retentionUntil: timestamp('retention_until').default(sql`now() + interval '2 years'`),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('resumes_user_id_idx').on(table.userId),
  statusIdx: index('resumes_status_idx').on(table.status),
  createdAtIdx: index('resumes_created_at_idx').on(table.createdAt),
  fileSizeCheck: check('file_size_check', sql`${table.fileSizeBytes} <= 5242880`),
  atsScoreCheck: check('ats_score_check', sql`${table.atsScore} >= 0 AND ${table.atsScore} <= 100`),
}));

// Resume versions table - Optimized outputs
export const resumeVersions = pgTable('resume_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Version info
  versionType: versionTypeEnum('version_type').notNull(),
  
  // AI metadata
  aiModelUsed: text('ai_model_used'),
  aiPromptVersion: text('ai_prompt_version'),
  generationParams: jsonb('generation_params'),
  
  // Content
  content: jsonb('content').notNull(),
  contentPlaintext: text('content_plaintext'),
  wordCount: integer('word_count'),
  keywordMatchScore: integer('keyword_match_score'),
  
  // Export URLs
  pdfUrl: text('pdf_url'),
  docxUrl: text('docx_url'),
  texUrl: text('tex_url'),
  
  // Tailoring
  targetJobDescriptionId: uuid('target_job_description_id'),
  
  // User feedback
  userRating: integer('user_rating'),
  userFeedback: text('user_feedback'),
  usedForApplication: boolean('used_for_application').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  resumeIdIdx: index('resume_versions_resume_id_idx').on(table.resumeId),
  userIdIdx: index('resume_versions_user_id_idx').on(table.userId),
  createdAtIdx: index('resume_versions_created_at_idx').on(table.createdAt),
  userRatingCheck: check('user_rating_check', sql`${table.userRating} >= 1 AND ${table.userRating} <= 5`),
  keywordScoreCheck: check('keyword_score_check', sql`${table.keywordMatchScore} >= 0 AND ${table.keywordMatchScore} <= 100`),
}));

// Job descriptions table - For tailoring
export const jobDescriptions = pgTable('job_descriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Job info
  companyName: text('company_name'),
  roleTitle: text('role_title').notNull(),
  location: text('location'),
  employmentType: employmentTypeEnum('employment_type'),
  
  // Description
  descriptionText: text('description_text').notNull(),
  requirements: text('requirements').array(),
  
  // Extracted data
  extractedKeywords: text('extracted_keywords').array(),
  requiredSkills: text('required_skills').array(),
  niceToHave: text('nice_to_have').array(),
  detectedSeniority: seniorityLevelEnum('detected_seniority'),
  
  // Source
  sourceUrl: text('source_url'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('job_descriptions_user_id_idx').on(table.userId),
  createdAtIdx: index('job_descriptions_created_at_idx').on(table.createdAt),
}));

// Optimization logs table - AI observability
export const optimizationLogs = pgTable('optimization_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').references(() => resumes.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // AI provider
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  
  // Tokens & cost
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  totalTokens: integer('total_tokens'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }),
  latencyMs: integer('latency_ms'),
  
  // Caching
  promptHash: text('prompt_hash'),
  cacheHit: boolean('cache_hit').default(false),
  
  // Errors
  success: boolean('success').notNull(),
  errorType: text('error_type'),
  retryCount: integer('retry_count').default(0),
  
  // Content moderation
  contentFlagged: boolean('content_flagged').default(false),
  moderationScores: jsonb('moderation_scores'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('optimization_logs_user_id_idx').on(table.userId),
  createdAtIdx: index('optimization_logs_created_at_idx').on(table.createdAt),
  providerModelIdx: index('optimization_logs_provider_model_idx').on(table.provider, table.model),
}));

// Payments table - Stripe integration
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Stripe IDs
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  stripeChargeId: text('stripe_charge_id'),
  
  // Amount
  amountUsd: decimal('amount_usd', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('usd'),
  
  // Status
  status: paymentStatusEnum('status').default('pending').notNull(),
  
  // Product
  productSku: productSkuEnum('product_sku').notNull(),
  creditsAdded: integer('credits_added'),
  
  // Subscription period (for recurring)
  subscriptionPeriodStart: timestamp('subscription_period_start'),
  subscriptionPeriodEnd: timestamp('subscription_period_end'),
  
  // Receipt
  receiptUrl: text('receipt_url'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }),
  
  // Metadata (for fraud detection)
  metadata: jsonb('metadata'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('payments_user_id_idx').on(table.userId),
  createdAtIdx: index('payments_created_at_idx').on(table.createdAt),
  statusIdx: index('payments_status_idx').on(table.status),
}));

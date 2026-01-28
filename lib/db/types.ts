import { 
  users, 
  resumes, 
  resumeVersions, 
  jobDescriptions, 
  optimizationLogs, 
  payments 
} from './schema';

// Type exports for the database schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type NewResumeVersion = typeof resumeVersions.$inferInsert;

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type NewJobDescription = typeof jobDescriptions.$inferInsert;

export type OptimizationLog = typeof optimizationLogs.$inferSelect;
export type NewOptimizationLog = typeof optimizationLogs.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// Re-export all schema
export * from './schema';

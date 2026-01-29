import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Fix for "max clients reached" error in Next.js
// Use singleton pattern to prevent connection pool exhaustion
declare global {
  // eslint-disable-next-line no-var
  var _queryClient: postgres.Sql | undefined;
  // eslint-disable-next-line no-var
  var _migrationClient: postgres.Sql | undefined;
}

// Connection for queries with proper pooling
// max: 10 connections (Neon's default pool size is 10 in Session mode)
// idle_timeout: Close idle connections after 20 seconds
// connect_timeout: Fail fast if connection takes > 10s
const queryClient = 
  globalThis._queryClient ||
  postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis._queryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });

// Connection for migrations (single connection)
const migrationClient = 
  globalThis._migrationClient ||
  postgres(process.env.DATABASE_URL!, { max: 1 });

if (process.env.NODE_ENV !== 'production') {
  globalThis._migrationClient = migrationClient;
}

export const migrationDb = drizzle(migrationClient, { schema });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection for queries
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });

// Connection for migrations  
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
export const migrationDb = drizzle(migrationClient, { schema });

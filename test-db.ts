// Test database connection
import { db } from './lib/db/index';
import { users } from './lib/db/schema';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')); // Hide password
    
    const result = await db.select().from(users).limit(1);
    console.log('✅ Connection successful!');
    console.log('Users table accessible:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();

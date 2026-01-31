// Test setup file
import { vi } from 'vitest';

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.GOOGLE_AI_API_KEY = 'test-google-key';
process.env.GROQ_API_KEY = 'test-groq-key';

// Mock fetch for API tests
global.fetch = vi.fn();

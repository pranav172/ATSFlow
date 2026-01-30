import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('CRITICAL: GOOGLE_AI_API_KEY is missing from .env.local');
  process.exit(1);
}

async function listModels() {
  console.log('Checking available models for API Key starting with:', apiKey.substring(0, 10) + '...');
  
  // Note: The SDK doesn't have a direct 'listModels' helper exposed easily in all versions,
  // but we can try to use the model generic or just a known one to ping.
  // Actually, for listModels, we might need a direct REST call if SDK doesn't expose it clearly on the main client.
  // But let's look at the SDK capabilities. The 'GoogleGenerativeAI' class usually just gets models.
  // We'll try a raw fetch to the API endpoint which is universal.
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to fetch models:', res.status, res.statusText);
      const text = await res.text();
      console.error('Response:', text);
      return;
    }
    
    const data = await res.json();
    console.log('\n--- AVAILABLE MODELS ---');
    if (data.models) {
        data.models.forEach((m: any) => {
             // Filter for generation models
             if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                 console.log(`- ${m.name}`);
             }
        });
    } else {
        console.log('No models found in response:', data);
    }
    console.log('------------------------\n');
    
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listModels();

/**
 * AI Router - Smart model selection based on task requirements
 * 
 * Groq (LLaMA) = Speed-critical tasks (real-time, quick polish)
 * Gemini = Accuracy-critical tasks (deep analysis, interview prep)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Initialize clients
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type AITask = 'quick-polish' | 'keyword-check' | 'deep-analysis' | 'interview-prep' | 'salary-insight';

interface AIRouterConfig {
  task: AITask;
  input: string;
  context?: string;
}

interface AIResponse {
  text: string;
  model: string;
  latency: number;
}

/**
 * Route AI requests to the optimal model
 */
export async function routeAI(config: AIRouterConfig): Promise<AIResponse> {
  const startTime = Date.now();
  
  // Determine which model to use
  const useGroq = ['quick-polish', 'keyword-check', 'salary-insight'].includes(config.task);
  
  if (useGroq && process.env.GROQ_API_KEY) {
    return await callGroq(config, startTime);
  } else {
    return await callGemini(config, startTime);
  }
}

async function callGroq(config: AIRouterConfig, startTime: number): Promise<AIResponse> {
  const prompt = buildPrompt(config);
  
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1000,
  });
  
  return {
    text: completion.choices[0]?.message?.content || '',
    model: 'groq-llama',
    latency: Date.now() - startTime,
  };
}

async function callGemini(config: AIRouterConfig, startTime: number): Promise<AIResponse> {
  const prompt = buildPrompt(config);
  const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return {
    text: response.text(),
    model: 'gemini-flash',
    latency: Date.now() - startTime,
  };
}

function buildPrompt(config: AIRouterConfig): string {
  switch (config.task) {
    case 'quick-polish':
      return `Rewrite this resume text to be more impactful. Use strong action verbs, be concise, add metrics if possible. Keep the same meaning, just improve the wording.

Original: "${config.input}"

Return ONLY the improved text, nothing else.`;

    case 'keyword-check':
      return `Extract the top 10 most important keywords/skills from this job description. Return as comma-separated list.

Job Description: "${config.input}"

Keywords:`;

    case 'salary-insight':
      return `Based on this job title and description, provide a brief salary estimate (US market). Be concise - just the range and one sentence context.

Job: "${config.input}"

Salary insight:`;

    case 'interview-prep':
      return `Generate 5 likely interview questions for this role. Focus on technical and behavioral questions based on the job requirements.

Job Description: "${config.input}"
${config.context ? `\nCandidate Background: "${config.context}"` : ''}

Questions (numbered 1-5):`;

    case 'deep-analysis':
    default:
      return config.input;
  }
}

/**
 * Quick polish - instantly improve any text
 */
export async function quickPolish(text: string): Promise<string> {
  const result = await routeAI({ task: 'quick-polish', input: text });
  return result.text;
}

/**
 * Extract keywords from job description
 */
export async function extractKeywords(jobDescription: string): Promise<string[]> {
  const result = await routeAI({ task: 'keyword-check', input: jobDescription });
  return result.text.split(',').map(k => k.trim()).filter(Boolean);
}

/**
 * Generate interview questions
 */
export async function generateInterviewQuestions(jobDescription: string, resumeContext?: string): Promise<string[]> {
  const result = await routeAI({ 
    task: 'interview-prep', 
    input: jobDescription,
    context: resumeContext 
  });
  
  // Parse numbered list
  const lines = result.text.split('\n').filter(l => l.match(/^\d+\./));
  return lines.map(l => l.replace(/^\d+\.\s*/, '').trim());
}

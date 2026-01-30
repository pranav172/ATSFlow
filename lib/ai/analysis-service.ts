import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { ResumeAnalysisSchema, ResumeAnalysis } from './schema';

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Lazy init for Groq to avoid crash if key is missing
let groq: Groq | null = null;
function getGroqClient() {
    if (!groq && process.env.GROQ_API_KEY) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
}

type AIProvider = 'gemini' | 'groq';

export class HybridAIService {
  private provider: AIProvider;

  constructor(provider: AIProvider = 'gemini') {
    this.provider = provider;
  }

  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    // For deep structured analysis, we prefer Gemini 2.5 due to its strong JSON adherence and large context
    if (this.provider === 'gemini') {
      return this.analyzeWithGemini(resumeText);
    } else {
        // Fallback or alternative implementation for Groq if needed
        // Currently keeping Gemini as primary for the main analysis due to complexity
        return this.analyzeWithGemini(resumeText);
    }
  }

  async optimizeText(text: string, instruction: string, provider: AIProvider = 'groq', context?: string): Promise<string> {
    if (provider === 'groq' && process.env.GROQ_API_KEY) {
        return this.optimizeWithGroq(text, instruction, context);
    }
    return this.optimizeWithGemini(text, instruction);
  }

  private async analyzeWithGemini(resumeText: string): Promise<ResumeAnalysis> {
    if (!process.env.GOOGLE_AI_API_KEY) throw new Error('GOOGLE_AI_API_KEY is not set');

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
        You are an expert ATS (Applicant Tracking System) optimization specialist. 
        Analyze the following resume text and provide a structured assessment.
        
        CRITICAL: Return valid JSON matching this structure:
        {
        "score": number (0-100),
        "summary": string,
        "strengths": string[],
        "weaknesses": string[],
        "hardSkills": string[],
        "softSkills": string[],
        "formattingIssues": string[],
        "missingSections": string[],
        "improvementSuggestions": string[]
        }

        Resume Text:
        """${resumeText}"""
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return ResumeAnalysisSchema.parse(JSON.parse(text));
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error('AI Analysis Failed');
    }
  }

  private async optimizeWithGroq(text: string, instruction: string, context?: string): Promise<string> {
      try {
          const client = getGroqClient();
          if (!client) throw new Error("Groq API Key missing");

          let systemPrompt = "You are an expert Resume Editor. Your ONLY task is to rewrite the input text to be more punchy, concise, and impact-driven. \n\nRULES:\n1. Return ONLY the rewritten text.\n2. Do NOT provide explanations, advice, or conversational filler.\n3. Use strong action verbs.\n4. If the input is a bullet point, keep it as a bullet point.";
          let userContent = `Instruction: ${instruction}\n\nOriginal Text: "${text}"\n\nRewritten Version:`;

          // If we have context (resume text) and the original text is likely a "missing section" instruction (short), switch to GENERATION mode.
          if (context && text.length < 200) {
             systemPrompt = "You are an expert Resume Writer. Your task is to GENERATE a new resume section based on the instruction and the candidate's background. \n\nRULES:\n1. Write ONLY the requested section content.\n2. Do NOT include 'Here is the summary'.\n3. Use professional, executive-level language.\n4. Base the content strictly on the provided Resume Context.";
             userContent = `Instruction: ${instruction}\n\nResume Context: """${context.slice(0, 8000)}"""\n\nGenerated Content:`;
          }

          const completion = await client.chat.completions.create({
              messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userContent }
              ],
              model: "llama-3.3-70b-versatile", 
              temperature: 0.5,
          });
          return completion.choices[0]?.message?.content || "";
      } catch (error) {
          console.error("Groq Optimization Error (falling back to Gemini):", error);
          return this.optimizeWithGemini(text, instruction);
      }
  }

  private async optimizeWithGemini(text: string, instruction: string): Promise<string> {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Rewrite this text. Instruction: ${instruction}. Original: "${text}". Return ONLY rewritten text.`;
      const result = await model.generateContent(prompt);
      return result.response.text();
  }
}

// Singleton or Helper Export
export const aiService = new HybridAIService();

// Legacy Wrapper for Analysis API
export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    return aiService.analyzeResume(resumeText);
}

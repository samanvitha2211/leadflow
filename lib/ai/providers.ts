import { generateText, type LanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

export const AIOutputSchema = z.object({
  category: z.enum(["sales", "support", "billing", "partnership", "other"]),
  priority: z.enum(["hot", "warm", "cold"]),
  suggested_reply: z.string().min(1),
});

export type AIClassificationResult = z.infer<typeof AIOutputSchema>;

export interface AIProvider {
  name: string;
  classify(rawText: string): Promise<AIClassificationResult>;
}

const SYSTEM_PROMPT = `You are an expert lead classification agent for LeadFlow.
Your job is to analyze the following lead message and determine its category, priority, and draft a suggested reply.
Rules:
1. Category MUST be one of: sales, support, billing, partnership, other.
2. Priority MUST be one of: hot, warm, cold.
3. Provide a concise, professional suggested reply.
Output ONLY valid JSON matching this exact structure:
{
  "category": "sales|support|billing|partnership|other",
  "priority": "hot|warm|cold",
  "suggested_reply": "your drafted reply here"
}`;

// ── Base Provider Class ──────────────────────────────────────────────
class BaseAIProvider implements AIProvider {
  constructor(public name: string, private model: LanguageModel) {}

  async classify(rawText: string): Promise<AIClassificationResult> {
    const { text } = await generateText({
      model: this.model,
      system: SYSTEM_PROMPT,
      prompt: `Lead message:\n${rawText}\n\nRespond strictly with JSON.`,
    });
    
    try {
      // Find the first { and last } to extract JSON from potentially chatty models
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonStr);
      return AIOutputSchema.parse(parsed);
    } catch (e) {
      console.error("[AI Engine] Failed to parse JSON:", text);
      throw new Error("Invalid JSON returned by AI");
    }
  }
}

// ── Concrete Providers ────────────────────────────────────────────────
export class OpenAIProvider extends BaseAIProvider {
  constructor() {
    super("OpenAI", openai("gpt-4o-mini"));
  }
}

export class GeminiProvider extends BaseAIProvider {
  constructor() {
    const googleObj = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    super("Gemini", googleObj("gemini-1.5-flash"));
  }
}

export class GroqProvider extends BaseAIProvider {
  constructor() {
    super("Groq", groq("llama-3.3-70b-versatile"));
  }
}

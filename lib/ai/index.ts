import { OpenAIProvider, GroqProvider, GeminiProvider, type AIProvider, type AIClassificationResult } from "./providers";

export function getAIProvidersChain(): AIProvider[] {
  const primary = process.env.AI_PROVIDER?.toLowerCase();
  
  const openai = new OpenAIProvider();
  const groq = new GroqProvider();
  const gemini = new GeminiProvider();

  switch (primary) {
    case "groq":
      return [groq, openai, gemini];
    case "gemini":
      return [gemini, openai, groq];
    case "openai":
    default:
      return [openai, groq, gemini];
  }
}

const FALLBACK_RESULT: AIClassificationResult = {
  category: "other",
  priority: "warm",
  suggested_reply: "",
};

export async function classifyLead(rawText: string, leadId: string): Promise<AIClassificationResult> {
  const providers = getAIProvidersChain();
  
  for (const provider of providers) {
    let attempts = 0;
    const maxRetries = 2; // 2 attempts per provider

    while (attempts < maxRetries) {
      try {
        attempts++;
        console.log(`[AI Engine] Attempting classification for lead ${leadId} using ${provider.name} (Attempt ${attempts})...`);
        const result = await provider.classify(rawText);
        console.log(`[AI Engine] Success using ${provider.name}`);
        return result;
      } catch (error: any) {
        // If it's a known quota/billing error, skip retries for this provider and instantly shift to the next one
        const isQuotaExceeded = error?.message?.includes("insufficient_quota") || error?.statusCode === 429;
        
        console.error(`[AI Engine] ${provider.name} failed (Attempt ${attempts}):`, error?.message || error);
        
        if (isQuotaExceeded) {
          console.warn(`[AI Engine] ${provider.name} quota exceeded! Shifting to next provider...`);
          break; // Break the retry loop for this provider, moving to the next provider in the chain
        }

        if (attempts >= maxRetries) {
          console.warn(`[AI Engine] ${provider.name} exhausted all retries. Shifting to next provider...`);
          break; // Exhausted retries, move to next provider
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
  }

  console.error(`[AI Engine] FATAL: All AI providers failed for lead ${leadId}. Using fallback blank response.`);
  return FALLBACK_RESULT;
}

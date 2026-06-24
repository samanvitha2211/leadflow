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

export async function fetchSearchContext(queryText: string, companyName?: string): Promise<string | null> {
  if (!process.env.TAVILY_API_KEY) {
    console.warn("[Tavily] TAVILY_API_KEY is missing. Skipping web search.");
    return null;
  }

  try {
    // If we have a company name, we append it to the search to get company-specific answers
    const searchQuery = companyName 
      ? `"${companyName}" ${queryText}`
      : queryText;

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "basic",
        max_results: 3,
      }),
    });

    if (!response.ok) {
      console.error("[Tavily] Search failed with status:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Combine the snippets from the top results
      const context = data.results.map((r: any) => r.content).join("\n\n");
      console.log(`[Tavily] Successfully fetched web context for query.`);
      return context;
    }
    
    return null;
  } catch (error) {
    console.error(`[Tavily] Error fetching context:`, error);
    return null;
  }
}

export async function classifyLead(rawText: string, leadId: string, companyName?: string): Promise<AIClassificationResult> {
  const providers = getAIProvidersChain();
  
  for (const provider of providers) {
    let attempts = 0;
    const maxRetries = 2; // 2 attempts per provider

    // Fetch web context based on the user's specific query to help the AI draft an accurate reply
    let enrichedText = rawText;
    const searchContext = await fetchSearchContext(rawText, companyName);
    
    if (searchContext) {
      enrichedText = `Message from user: ${rawText}\n\n--- Web Search Results (Use this information to directly answer the user's query in your suggested_reply) ---\n${searchContext}`;
      if (companyName) {
        enrichedText += `\n\nNote: The user is from the company "${companyName}". Tailor the response to their business if applicable.`;
      }
    } else if (companyName) {
      enrichedText = `Message from user: ${rawText}\n\nNote: The user is from the company "${companyName}".`;
    }

    while (attempts < maxRetries) {
      try {
        attempts++;
        console.log(`[AI Engine] Attempting classification for lead ${leadId} using ${provider.name} (Attempt ${attempts})...`);
        const result = await provider.classify(enrichedText);
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

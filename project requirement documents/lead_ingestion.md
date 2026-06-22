# LeadFlow PRD Phase: Lead Ingestion & AI Engine

## 1. Overview
This module handles the intake of new leads into the system and the immediate, automated AI classification workflow that follows.

## 2. Lead Ingestion Methods

### 2.1 Manual Entry (`/leads/new`)
*   **UI:** A simple form utilizing `react-hook-form` and `zod` validation.
*   **Fields:** Name (string), Message (string).
*   **Action:** Submitting the form calls `POST /api/leads`, saving the raw data to the database with the source marked as `manual`.

### 2.2 CSV Upload (`/import`)
*   **UI:** A drag-and-drop file upload zone.
*   **CSV Format:** Expects columns `name` and `message`.
*   **Logic:**
    1. Parse CSV client-side or server-side.
    2. Validate rows. Skip invalid rows (missing name or message).
    3. Batch insert valid rows into the `leads` database table with the source marked as `csv`.
    4. Display an Import Summary UI (e.g., "100 processed, 95 imported, 5 failed").

## 3. The AI Classification Engine

### 3.1 Trigger Flow
*   When a new lead is inserted into the database, it triggers the AI classification process. (This can be done via a serverless function asynchronously to not block the UI response).

### 3.2 AI Provider Abstraction
*   The system must abstract the AI service so it can use OpenAI, Groq, or Gemini based on environment variables (e.g., `AI_PROVIDER=openai`).

### 3.3 Prompt & Output Schema
*   **Input:** The lead's `raw_text`.
*   **Expected Output:** Structured JSON matching a strict Zod schema:
    ```typescript
    {
     category: z.enum(["sales", "support", "billing", "partnership", "other"]),
     priority: z.enum(["hot", "warm", "cold"]),
     suggested_reply: z.string()
    }
    ```

### 3.4 Error Handling & Fallbacks
*   **Performance Requirement:** AI classification must complete in < 10 seconds.
*   **Retry Logic:** If the AI returns invalid JSON, retry up to 2 times.
*   **Fallback:** If the AI fails completely, use a fallback object to prevent crashing:
    `{ "category": "other", "priority": "warm", "suggested_reply": "" }`
*   Log any AI failures for debugging.

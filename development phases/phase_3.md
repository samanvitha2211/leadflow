# Phase 3: AI Classification Engine & Lead Ingestion

## Goal
Build the lead intake pipeline — supporting both manual entry and CSV bulk upload — and implement the AI Classification Engine that automatically categorizes, prioritizes, and generates a suggested reply for every new lead.

---

## 1. AI Classification Engine (`/lib/ai/`)

### 1.1 Provider Abstraction Layer
The system must support multiple AI providers, selected at runtime via environment variable (`AI_PROVIDER=openai|groq|gemini`). Build a factory function:

```typescript
// /lib/ai/index.ts
export function getAIProvider(): AIProvider {
  switch (process.env.AI_PROVIDER) {
    case 'groq':    return new GroqProvider();
    case 'gemini':  return new GeminiProvider();
    default:        return new OpenAIProvider();
  }
}
```

Each provider class implements a common `AIProvider` interface:
```typescript
interface AIProvider {
  classify(rawText: string): Promise<AIClassificationResult>;
}
```

### 1.2 Prompt Construction
- **System Prompt:** Instruct the AI to act as a lead classification agent and return ONLY valid JSON.
- **User Message:** The raw lead text.
- **Expected Output Schema (Zod):**
  ```typescript
  const AIOutputSchema = z.object({
    category:         z.enum(['sales', 'support', 'billing', 'partnership', 'other']),
    priority:         z.enum(['hot', 'warm', 'cold']),
    suggested_reply:  z.string().min(1),
  });
  ```

### 1.3 Retry & Fallback Logic
Performance requirement: < 10 seconds total.

```
Attempt 1: Call AI provider
      ↓
Valid JSON? → Parse & return result
      ↓
Invalid/Error → Retry (Attempt 2)
      ↓
Invalid/Error → Retry (Attempt 3)
      ↓
All failed → Return fallback object + log error
```

**Fallback Object:**
```json
{ "category": "other", "priority": "warm", "suggested_reply": "" }
```

**Error Logging:** Log AI failures (provider, error message, raw_text excerpt) to console and optionally to a `ai_errors` log table.

### 1.4 Async Classification Flow
When `POST /api/leads` is called:
1. Save the lead to the database immediately (fast response to user).
2. Trigger AI classification **asynchronously** (non-blocking — use `fetch` to a background endpoint, or a Vercel background function).
3. Once AI responds, update the lead record: `ai_category`, `ai_priority`, `suggested_reply`.
4. Insert an `activity_log` record: `action = 'AI Classified'`.

---

## 2. Manual Lead Entry (`/leads/new`)

### 2.1 API Route — `POST /api/leads`
- **Body:** `{ name: string, message: string }`
- **Validation:** Zod — name required (min 2 chars), message required (min 10 chars).
- **Logic:**
  1. Insert lead into `leads` table with `source = 'manual'`.
  2. Insert `activity_log` entry: `action = 'Lead Created'`.
  3. Trigger async AI classification.
  4. Return the new lead ID.

### 2.2 UI — Create Lead Form (`/leads/new`)
- Clean, centered glassmorphic card with two fields:
  - **Name** — Text input.
  - **Message** — Textarea (minimum 4 rows).
- Built with `react-hook-form` + `zod` — inline validation errors below each field.
- Submit button: Electric Violet with glow, shows loading spinner while in flight.
- On success: Redirect to the new lead's detail page `/leads/[id]`.
- On error: Display error toast.

---

## 3. CSV Import (`/import`)

### 3.1 API Route — `POST /api/import`
- **Input:** Multipart form data with a `.csv` file.
- **Expected CSV columns:** `name`, `message`.
- **Processing Logic:**
  1. Parse CSV (use `papaparse` library for robustness).
  2. Validate each row: skip rows where `name` or `message` is empty/missing.
  3. Batch insert all valid rows into `leads` table with `source = 'csv'`.
  4. For each valid inserted lead, trigger async AI classification.
  5. Insert one `activity_log` entry per valid lead: `action = 'Lead Created'`.
  6. Return summary: `{ total, imported, failed, failedRows }`.

### 3.2 UI — CSV Import Page (`/import`)

#### Drag-and-Drop Upload Zone (from `design.md` §4.5)
- A large dashed-border drop zone area.
- **Idle state:** "Drag & Drop your CSV here or click to browse" with a file icon.
- **Drag-over state:** Border glows Electric Violet (`pulse-glow` animation), background tints slightly.
- **File selected:** Shows file name and size.
- **Upload button:** Triggered after file selection.

#### Progress & Summary Animation
```
File dropped
    ↓
Animated progress bar (indeterminate) with "Importing..." label
    ↓
Import completes
    ↓
Colorful summary card animates in:
  ✅ 95 Leads Imported  (Green)
  ❌ 5 Failed            (Red)
  📄 100 Rows Processed  (Gray)
```
- Optional: "View Failed Rows" expandable section showing which rows failed and why.
- "Go to Dashboard" button after completion.

### 3.3 CSV Format Documentation
- Display a downloadable sample CSV template on the page.
- Show accepted column names in a code block.

---

## 4. API Route: AI Classification Trigger (`POST /api/leads/:id/classify`)
An internal endpoint called by the async flow:
- Fetches the lead's `raw_text`.
- Calls the AI provider.
- Updates `ai_category`, `ai_priority`, `suggested_reply` on the lead.
- Inserts activity log entry.
- Returns updated lead.

---

## Acceptance Criteria
- [ ] Manual lead form validates and saves a lead to Supabase.
- [ ] After manual submission, the lead appears in the database with `status = 'new'`.
- [ ] AI classification runs and updates `ai_category`, `ai_priority`, `suggested_reply` within 10 seconds.
- [ ] Fallback values are used when the AI fails (no crash).
- [ ] CSV with 100 rows (mix of valid/invalid) is processed correctly with accurate summary.
- [ ] `activity_log` gets a "Lead Created" entry for every new lead.
- [ ] `activity_log` gets an "AI Classified" entry after classification.
- [ ] Drag-and-drop glow animation works on file hover.

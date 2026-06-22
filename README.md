# LeadFlow AI Platform

LeadFlow is an intelligent, high-performance SaaS internal lead management system. It automatically ingests, classifies, and prioritizes incoming leads using an integrated AI engine (OpenAI, Groq, or Gemini). Designed for speed and operational efficiency, it features a stunning glassmorphism interface, real-time activity auditing, and robust Role-Based Access Control (RBAC).

## Features
- **AI Classification Engine**: Automatically categorizes leads, assigns a priority (Hot, Warm, Cold), and generates a suggested reply.
- **Human-in-the-Loop Overrides**: Managers can override AI suggestions while the system preserves original AI values for auditing.
- **Robust RBAC**: Admins have full access to User Management and global system overrides, while Managers focus on their assigned pipelines.
- **Comprehensive Activity Log**: Every action (creation, assignment, overrides, status changes) is tracked immutably.
- **CSV Ingestion**: Drag-and-drop CSV upload for bulk lead processing.
- **Modern UI/UX**: Built with a sleek dark-mode glassmorphism design, fluid framer-motion animations, and staggered loading states.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, `framer-motion`
- **UI Components**: Shadcn UI (Base UI under the hood)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **AI Integration**: OpenAI SDK, Groq SDK, Google Generative AI SDK

## Local Development Setup

### 1. Clone & Install
```bash
git clone <repository-url>
cd LeadFlow
npm install
```

### 2. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Fill in the required keys. You will need:
- Your Supabase Project URL and Anon Key.
- Your Supabase Service Role Key (Required for atomic Admin user creation).
- At least one AI Provider API key (OpenAI, Groq, or Gemini).

### 3. Supabase Setup
If you are using a local Supabase instance or a new remote project, run the initial schema and indexes migrations:
```bash
# Apply the schema
supabase db push
# OR manually run the contents of /supabase/migrations/001_initial_schema.sql and 002_indexes.sql in your Supabase SQL Editor.
```

### 4. Create Your First Admin
Since the API enforces Admin-only user creation via the `/users` dashboard, you must manually elevate your first account:
1. Sign up on the `/login` page.
2. Open your Supabase Dashboard -> Table Editor -> `users` table.
3. Change the `role` cell of your user from `manager` to `admin`.
4. Refresh the app. The "User Management" tab will appear.

### 5. Run the Application
```bash
npm run dev
```

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key for bypassing RLS in Route Handlers |
| `AI_PROVIDER` | `openai`, `groq`, or `gemini` |
| `OPENAI_API_KEY` | Required if AI_PROVIDER=openai |
| `GROQ_API_KEY` | Required if AI_PROVIDER=groq |
| `GEMINI_API_KEY` | Required if AI_PROVIDER=gemini |

## Vercel Production Deployment

LeadFlow is optimized for Vercel deployment using Next.js Server Components and Edge functions.

1. Create a new project on Vercel and import this repository.
2. Under **Environment Variables**, copy all the keys from your `.env.local`.
3. Ensure the Build Command is `npm run build` and the Install Command is `npm install`.
4. Click **Deploy**.

*Note: Ensure your production Supabase database has all migrations (`001_initial_schema.sql` and `002_indexes.sql`) applied before deploying.*
# leadflow

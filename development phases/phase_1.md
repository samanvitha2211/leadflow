# Phase 1: Project Setup, Design System & Database Foundation

## Goal
Establish the complete project scaffold, configure the design system from `design.md`, and set up the Supabase database schema that every other phase depends on. This phase produces no visible features — it is the bedrock everything else builds on.

---

## 1. Repository & Framework Setup

### 1.1 Initialize Next.js 15 Application
- Bootstrap project with **Next.js 15 (App Router)** and **TypeScript**.
- Install and configure all core dependencies:
  - `tailwindcss` + `postcss` + `autoprefixer`
  - `shadcn/ui` — initialize with custom theme
  - `framer-motion` — for all animation requirements
  - `react-hook-form` + `zod` — form state and validation
  - `@tanstack/react-table` — data tables
  - `recharts` — dashboard charting
  - `lucide-react` — iconography
  - `@supabase/supabase-js` + `@supabase/ssr` — database and auth client

### 1.2 Project Directory Structure
```
/app                    ← Next.js App Router pages
  /login
  /dashboard
  /leads
    /new
    /[id]
  /import
  /activity
  /users
/components             ← Reusable UI components
  /ui                   ← shadcn base components
  /layout               ← Sidebar, Navbar, etc.
  /charts               ← Recharts wrappers
/lib                    ← Utility functions
  /supabase             ← Supabase client + types
  /ai                   ← AI provider abstraction
  /utils.ts
/types                  ← Global TypeScript interfaces
/middleware.ts          ← Next.js RBAC middleware
```

---

## 2. Design System Configuration (from `design.md`)

### 2.1 TailwindCSS Theme Extension (`tailwind.config.ts`)
Extend Tailwind with the full custom palette and animation tokens:

```typescript
colors: {
  primary:     '#8B5CF6', // Electric Violet
  hot:         '#FF4D4D', // Neon Coral
  warm:        '#F59E0B', // Amber Gold
  cold:        '#38BDF8', // Ice Blue
  background:  '#0B0F19', // Deep Indigo/Navy (Dark Mode)
}

animation: {
  'pulse-glow':      'pulseGlow 2s ease-in-out infinite',
  'gradient-shift':  'gradientShift 5s ease infinite',
}
```

### 2.2 shadcn/ui Theme (`theme.css` / `globals.css`)
- Map CSS variables to the Electric Violet primary and the dark-mode palette.
- Define glass-panel utility class (used on Sidebar, Cards, Navbar):
  ```css
  .glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  ```

### 2.3 Typography
- Import **Inter** or **Outfit** from Google Fonts in `layout.tsx`.
- Apply font weights: Regular (400) body, Medium (500) buttons/headers, Semibold (600) titles.

### 2.4 Global CSS Keyframes
```css
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(139,92,246,0.3); }
  50%       { box-shadow: 0 0 30px rgba(139,92,246,0.8); }
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## 3. Supabase Project & Database Schema

### 3.1 Supabase Project
- Create a Supabase project and store credentials in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  AI_PROVIDER=openai
  OPENAI_API_KEY=...
  ```

### 3.2 Database Migrations

#### `users` Table
```sql
create table users (
  id uuid primary key references auth.users(id),
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'manager')),
  created_at timestamp with time zone default now()
);
```

#### `leads` Table
```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text not null,         -- 'manual' | 'csv'
  raw_text text not null,

  -- Immutable AI outputs
  ai_category text,
  ai_priority text,

  -- Mutable human overrides
  current_category text,
  current_priority text,
  suggested_reply text,

  status text default 'new' check (status in ('new', 'in_progress', 'closed')),
  assigned_to uuid references users(id) on delete set null,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `activity_log` Table
```sql
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references users(id) on delete set null, -- null for AI/system actions
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamp with time zone default now()
);
```

#### `updated_at` Trigger (for `leads`)
```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_leads_updated_at
  before update on leads
  for each row execute function update_updated_at_column();
```

### 3.3 Row Level Security (RLS)
- Enable RLS on all tables.
- Allow authenticated users to read `leads` and `activity_log`.
- Restrict mutations based on role (enforced both by RLS policies and API layer).

### 3.4 Supabase TypeScript Types
- Generate TypeScript types from the Supabase schema:
  ```bash
  npx supabase gen types typescript --project-id <id> > types/supabase.ts
  ```

---

## 4. Supabase Client Setup (`/lib/supabase/`)
- `client.ts` — Browser-side Supabase client.
- `server.ts` — Server-side Supabase client (for Server Components and Route Handlers).

---

## 5. Global TypeScript Types (`/types/index.ts`)
Define shared interfaces for use across all phases:
```typescript
export type Role = 'admin' | 'manager';
export type LeadStatus = 'new' | 'in_progress' | 'closed';
export type LeadCategory = 'sales' | 'support' | 'billing' | 'partnership' | 'other';
export type LeadPriority = 'hot' | 'warm' | 'cold';
export type LeadSource = 'manual' | 'csv';

export interface User { ... }
export interface Lead { ... }
export interface ActivityLog { ... }
```

---

## 6. Deployment Configuration
- Connect the repository to **Vercel**.
- Configure all environment variables in the Vercel project dashboard.
- Confirm the first successful deployment of the skeleton app.

---

## Acceptance Criteria
- [ ] `npm run dev` starts without errors.
- [ ] Tailwind design tokens and glass-panel classes render correctly.
- [ ] All three Supabase tables exist and are confirmed in the Supabase dashboard.
- [ ] TypeScript types are generated and importable.
- [ ] App deploys to Vercel without build errors.
- [ ] Environment variables are documented in `.env.example`.

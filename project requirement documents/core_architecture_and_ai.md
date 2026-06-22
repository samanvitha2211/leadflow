# LeadFlow PRD Phase: Core Architecture & Database

## 1. Overview
This module outlines the foundational technology stack, deployment strategy, and the core database schema required to support all other LeadFlow modules.

## 2. Technology Stack
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** TailwindCSS, shadcn/ui
*   **State/Forms:** React Hook Form, Zod Validation
*   **Data Tables:** TanStack Table
*   **Backend Logic:** Next.js Server & Route Handlers
*   **Database:** Supabase PostgreSQL
*   **Deployment:** Vercel

## 3. Database Schema

### 3.1 Users Table
*Stores role definitions to augment Supabase Auth.*
```sql
create table users (
  id uuid primary key,
  name text not null,
  email text unique not null,
  role text not null, -- 'admin' or 'manager'
  created_at timestamp default now()
);
```

### 3.2 Leads Table
*The core entity of the application. Note the separation of AI values vs. Current (Human) values.*
```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text not null, -- 'manual', 'csv', etc.
  raw_text text not null,
  
  -- AI Generated Data (Immutable once generated)
  ai_category text,
  ai_priority text,
  
  -- Current Operative Data (Mutable by human overrides)
  current_category text,
  current_priority text,
  suggested_reply text,
  
  status text default 'new', -- 'new', 'in_progress', 'closed'
  assigned_to uuid references users(id),
  
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### 3.3 Activity Log Table
*For audit trails.*
```sql
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  user_id uuid references users(id),
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamp default now()
);
```

## 4. MVP Acceptance Criteria
*   Application deploys successfully on Vercel.
*   Environment variables are configured for Supabase and the chosen AI Provider.
*   Database migrations are committed and reproducible.

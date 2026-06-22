-- ================================================================
-- LeadFlow Database Migration: 001_initial_schema
-- Run this in the Supabase SQL Editor or via the Supabase CLI
-- ================================================================

-- ── EXTENSION ──────────────────────────────────────────────────
-- uuid_generate_v4() is available by default in Supabase;
-- gen_random_uuid() is used in the schema (no extension needed).

-- ── 1. USERS TABLE ─────────────────────────────────────────────
-- Augments Supabase Auth (auth.users). The `id` column is a
-- foreign key to auth.users so they stay in sync.

create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text unique not null,
  role       text not null default 'manager'
               check (role in ('admin', 'manager')),
  created_at timestamp with time zone default now() not null
);

comment on table public.users is
  'Application-level user profiles, augmenting Supabase Auth.';

-- ── 2. LEADS TABLE ─────────────────────────────────────────────
create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  source           text not null
                     check (source in ('manual', 'csv')),
  raw_text         text not null,

  -- AI Generated Data (immutable once set)
  ai_category      text check (ai_category in ('sales','support','billing','partnership','other')),
  ai_priority      text check (ai_priority in ('hot','warm','cold')),

  -- Human Overrides (mutable)
  current_category text check (current_category in ('sales','support','billing','partnership','other')),
  current_priority text check (current_priority in ('hot','warm','cold')),
  suggested_reply  text,

  status           text not null default 'new'
                     check (status in ('new','in_progress','closed')),
  assigned_to      uuid references public.users(id) on delete set null,

  created_at       timestamp with time zone default now() not null,
  updated_at       timestamp with time zone default now() not null
);

comment on table public.leads is
  'Core lead entity. AI values are immutable once written; current_* fields hold human overrides.';
comment on column public.leads.ai_category    is 'AI-generated category — never overwrite.';
comment on column public.leads.ai_priority    is 'AI-generated priority — never overwrite.';
comment on column public.leads.current_category is 'Human override for category (mutable).';
comment on column public.leads.current_priority is 'Human override for priority (mutable).';

-- ── 3. ACTIVITY_LOG TABLE ──────────────────────────────────────
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references public.leads(id) on delete cascade,
  user_id    uuid references public.users(id) on delete set null,  -- null = System/AI action
  action     text not null,
  old_value  jsonb,
  new_value  jsonb,
  created_at timestamp with time zone default now() not null
);

comment on table public.activity_log is
  'Immutable audit trail. Every significant action on a lead is recorded here.';
comment on column public.activity_log.user_id is
  'NULL indicates a system/AI-generated action.';

-- ── 4. TRIGGER — auto-update `leads.updated_at` ───────────────
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_leads_updated_at
  before update on public.leads
  for each row
  execute function public.update_updated_at_column();

-- ── 5. ROW LEVEL SECURITY ─────────────────────────────────────
-- Enable RLS on all tables (auth happens at the application layer
-- via service-role key in Route Handlers, or via user JWT for reads)

alter table public.users        enable row level security;
alter table public.leads        enable row level security;
alter table public.activity_log enable row level security;

-- Allow authenticated users to READ all data
create policy "Authenticated users can read users"
  on public.users for select
  to authenticated
  using (true);

create policy "Authenticated users can read leads"
  on public.leads for select
  to authenticated
  using (true);

create policy "Authenticated users can read activity_log"
  on public.activity_log for select
  to authenticated
  using (true);

-- All INSERT / UPDATE / DELETE goes through Route Handlers
-- that use the service_role key, which bypasses RLS.
-- This keeps mutation logic fully server-side and secure.

-- ── 6. PERFORMANCE INDEXES ────────────────────────────────────
create index if not exists idx_leads_status        on public.leads (status);
create index if not exists idx_leads_current_priority on public.leads (current_priority);
create index if not exists idx_leads_current_category on public.leads (current_category);
create index if not exists idx_leads_assigned_to   on public.leads (assigned_to);
create index if not exists idx_leads_source        on public.leads (source);
create index if not exists idx_leads_created_at    on public.leads (created_at desc);
create index if not exists idx_activity_lead_id    on public.activity_log (lead_id);
create index if not exists idx_activity_created_at on public.activity_log (created_at desc);

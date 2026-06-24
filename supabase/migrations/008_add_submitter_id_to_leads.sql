-- Migration 008: Add submitter_id to leads

-- 1. Add submitter_id to leads table, linking to users table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS submitter_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- 2. Add an index for performance when filtering by user
CREATE INDEX IF NOT EXISTS idx_leads_submitter_id ON public.leads(submitter_id);

-- 3. Update comments
COMMENT ON COLUMN public.leads.submitter_id IS 'The authenticated user who submitted this lead, if any.';

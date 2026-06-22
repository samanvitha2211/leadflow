-- Migration: Add email column to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.leads.email IS 'Contact email for the lead, used for outbound replies.';

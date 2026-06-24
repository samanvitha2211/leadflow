-- Add phone_number and company_name columns to leads table
alter table public.leads add column if not exists phone_number text;
alter table public.leads add column if not exists company_name text;

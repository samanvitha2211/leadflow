-- Add manager_reply column to leads table
alter table public.leads add column if not exists manager_reply text;

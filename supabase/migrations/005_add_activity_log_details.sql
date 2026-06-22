-- Add details column to activity_log
alter table public.activity_log
add column if not exists details text;

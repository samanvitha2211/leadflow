-- Migration: Add user role and update RLS policies

DO $$ 
DECLARE
  constraint_name text;
BEGIN
  -- Find the check constraint on the role column of the users table
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) LIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || constraint_name;
  END IF;

  -- Add the new constraint
  ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'user'));
END $$;

-- Update RLS policies for `leads` table to restrict 'user' role
DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;

CREATE POLICY "Admins and managers can read all leads" 
  ON public.leads FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can read their own leads by email" 
  ON public.leads FOR SELECT 
  TO authenticated 
  USING (
    email = (
      SELECT email FROM public.users WHERE id = auth.uid()
    )
  );

-- Update RLS policies for `activity_log` table
DROP POLICY IF EXISTS "Authenticated users can read activity_log" ON public.activity_log;

CREATE POLICY "Admins and managers can read all activity_log" 
  ON public.activity_log FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can read their own lead activities" 
  ON public.activity_log FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = activity_log.lead_id
      AND leads.email = (SELECT email FROM public.users WHERE id = auth.uid())
    )
  );

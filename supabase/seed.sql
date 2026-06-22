-- ================================================================
-- LeadFlow Seed Data: Demo users for local development
-- ⚠️  Run ONLY in development. Do NOT run in production.
-- ================================================================
--
-- WHY THIS FILE IS DIFFERENT FROM A NORMAL SEED:
-- Supabase has two separate user systems:
--   1. auth.users  → Managed by Supabase Auth (passwords, sessions)
--   2. public.users → Your custom table (name, role, etc.)
-- Both must exist and share the same UUID for a user to work.
-- You cannot insert into auth.users directly via SQL — Supabase
-- blocks this for security. So you must create the auth user
-- through the Dashboard or Auth API first, then run this file.
--
-- ================================================================
-- STEP-BY-STEP: CREATE YOUR FIRST ADMIN USER
-- ================================================================
--
-- STEP 1 ─ Create the auth user in Supabase Dashboard:
--   → Go to: https://supabase.com/dashboard
--   → Select your project
--   → Click "Authentication" in the left sidebar
--   → Click "Users" tab
--   → Click the green "Add user" button → "Create new user"
--   → Enter:
--       Email:    your-email@example.com
--       Password: choose a strong password
--   → Click "Create User"
--   → COPY the UUID shown in the user list (looks like: abc12345-...)
--
-- STEP 2 ─ Paste your UUID below and run this SQL:
--   → Go to: Supabase Dashboard → SQL Editor
--   → Replace 'PASTE-YOUR-UUID-HERE' with the UUID you copied
--   → Replace the name and email to match what you used in Step 1
--   → Run the INSERT statement
--
-- ================================================================

-- ── INSERT YOUR ADMIN USER ─────────────────────────────────────
-- Uncomment the lines below, fill in your values, then run.

-- insert into public.users (id, name, email, role)
-- values (
--   'PASTE-YOUR-UUID-HERE',      -- UUID from Supabase Auth → Users
--   'Your Full Name',            -- Your display name in the app
--   'your-email@example.com',    -- Must match the email from Step 1
--   'admin'                      -- 'admin' | 'manager'
-- );


-- ================================================================
-- OPTIONAL: Add a second user (Manager role) for testing
-- ================================================================
-- Repeat Step 1 in the Dashboard for a second user, then:

-- insert into public.users (id, name, email, role)
-- values (
--   'PASTE-SECOND-UUID-HERE',
--   'Manager Name',
--   'manager@example.com',
--   'manager'
-- );


-- ================================================================
-- VERIFY: Check your users were inserted correctly
-- ================================================================
-- Run this query after inserting to confirm everything looks right:

-- select id, name, email, role, created_at from public.users;


-- ================================================================
-- HELPER: Quick integrity check
-- ================================================================
-- This query shows any public.users rows that DON'T have a
-- matching auth.users entry (which would break authentication).
-- All rows should return 0 results if everything is correct.

-- select u.id, u.email
-- from public.users u
-- left join auth.users a on a.id = u.id
-- where a.id is null;


-- ================================================================
-- NOTES FOR PHASE 7+
-- ================================================================
-- Once the Admin Module (Phase 7) is built, you will NEVER need
-- to run this file again. The app's /users page will handle
-- creating new team members automatically via the Supabase Admin
-- API — both the auth user and the public.users record will be
-- created together in one click.
-- ================================================================

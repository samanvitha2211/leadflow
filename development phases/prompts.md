# LeadFlow AI Agent Development Prompts

This document contains a series of prompts designed to guide an AI agent through the sequential development of the LeadFlow application. Each prompt builds upon the previous phases and includes specific instructions for the agent to follow.

## General Instructions for the AI Agent (Apply to ALL Phases)
Before starting, read these global rules:
1. **Incremental Development:** Build only what is specified in the current phase. Do not jump ahead.
2. **Context Awareness:** Ensure the current phase seamlessly integrates with code written in previous phases.
3. **Environment Variables:** If a phase requires new environment variables, explicitly list them at the end of your response and tell the user to update their `.env.local` file.
4. **Missing Details:** If any requirements are ambiguous or missing, halt development and explicitly ask the user for clarification before proceeding.
5. **Testing & Verification:** Provide instructions on how the user can test the newly implemented features to verify the acceptance criteria.
6. **Code Quality:** Ensure all code adheres to the "Classic Modern UI" design system, uses TypeScript strictly, and handles errors gracefully.

---

## Prompt for Phase 1: Project Setup & Database Foundation
**Agent Context:** You are starting a greenfield project. This phase creates the foundation for the entire LeadFlow application.

**Task:** Please implement Phase 1 as detailed in `development phases/phase_1.md`.

**Specific Instructions:**
- Initialize a Next.js 15 (App Router) project with TypeScript.
- Set up TailwindCSS, `shadcn/ui`, and configure the custom color palette and glassmorphism utilities from the design specs.
- Create the Supabase database migrations for the `users`, `leads`, and `activity_log` tables. Generate the TypeScript types for the schema.
- **When Finished:** 
  1. Tell me exactly what environment variables I need to add to my `.env.local` for Supabase.
  2. Ask me to run `npm run db:setup` to automatically apply the database migrations.
  3. Ask me if there are any missing details or if I want to adjust the schema before moving to Phase 2.

---

## Prompt for Phase 2: Authentication & App Shell
**Agent Context:** You are building on top of Phase 1. The database schema and design system are in place.

**Task:** Please implement Phase 2 as detailed in `development phases/phase_2.md`.

**Specific Instructions:**
- Integrate Supabase Auth for an email/password login flow.
- Build the glassmorphic login page.
- Implement the Next.js Middleware to protect internal routes (`/dashboard`, `/leads`, etc.) and enforce Role-Based Access Control (RBAC) ensuring Managers cannot access Admin routes like `/users`.
- Build the global authenticated layout (Sidebar and Navbar) using `framer-motion` for page transitions.
- **When Finished:**
  1. Explain how I can test the login flow and RBAC middleware.
  2. Let me know if I need to configure anything in the Supabase Dashboard (like Auth providers).
  3. Ask if the layout and design match my expectations.

---

## Prompt for Phase 3: AI Engine & Lead Ingestion
**Agent Context:** Authentication and layout from Phase 2 are complete. Now we need to populate the `leads` table created in Phase 1.

**Task:** Please implement Phase 3 as detailed in `development phases/phase_3.md`.

**Specific Instructions:**
- Build the AI Classification Engine abstraction (`/lib/ai`). Ensure it can handle OpenAI, Groq, or Gemini.
- Implement the manual lead creation form (`/leads/new`).
- Implement the drag-and-drop CSV upload functionality (`/import`).
- Ensure that creating a lead (manually or via CSV) triggers the AI classification asynchronously and creates an `activity_log` entry.
- **When Finished:**
  1. Tell me what new environment variables (e.g., API keys for the AI providers) I need to add to `.env.local`.
  2. Explain how the AI error handling and fallback mechanism is working.
  3. Ask if you need any clarification on the AI prompt or CSV format.

---

## Prompt for Phase 4: Dashboard & Data Visualization
**Agent Context:** We now have leads in our database from Phase 3. Phase 4 will display them within the layout built in Phase 2.

**Task:** Please implement Phase 4 as detailed in `development phases/phase_4.md`.

**Specific Instructions:**
- Build the main `/dashboard` page.
- Integrate `recharts` for the top metric cards (Total Leads, Leads by Priority, Leads by Category).
- Build the `TanStack Table` for the leads list with global search, 5 filter dropdowns, sorting, and pagination.
- Ensure the table uses the color-coded badges defined in the design system.
- **When Finished:**
  1. Explain how the paginated API handles the complex filtering logic.
  2. Provide instructions on how I can test the search and filter functionalities.
  3. Ask if the table columns and charts meet the requirements.

---

## Prompt for Phase 5: Lead Details & Overrides
**Agent Context:** Users can view the dashboard (Phase 4), but clicking a lead needs to go somewhere. This phase connects the dashboard to individual lead views.

**Task:** Please implement Phase 5 as detailed in `development phases/phase_5.md`.

**Specific Instructions:**
- Build the `/leads/[id]` two-column page.
- Display the AI Analysis card with the iridescent animated border.
- Implement the Human Override form. **CRITICAL:** Ensure that saving overrides updates `current_category` and `current_priority`, but NEVER overwrites the original `ai_category` and `ai_priority`.
- Implement the status change and assignment workflow.
- Ensure every action creates an `activity_log` entry, and display the lead-specific activity timeline at the bottom of the page.
- **When Finished:**
  1. Confirm that the override logic is safely preserving AI values.
  2. Ask if the layout for the lead details page feels balanced or needs adjustments.

---

## Prompt for Phase 6: Global Activity Audit Log
**Agent Context:** The logging mechanism was established in Phase 1 and utilized in Phases 3 and 5. Now we need a global view for Admins and Managers.

**Task:** Please implement Phase 6 as detailed in `development phases/phase_6.md`.

**Specific Instructions:**
- Build the `/activity` page showing a system-wide timeline of all events.
- Implement filters for Date Range, Action Type, and User.
- Ensure the API handles pagination and joins with the `users` and `leads` tables to display readable names.
- **When Finished:**
  1. Let me know how the activity log API performs with large datasets.
  2. Ask if the icons and colors chosen for the timeline events are satisfactory.

---

## Prompt for Phase 7: Admin Module & User Management
**Agent Context:** The core app is done. Now we need to give Admins the ability to manage the team, finalizing the RBAC logic introduced in Phase 2.

**Task:** Please implement Phase 7 as detailed in `development phases/phase_7.md`.

**Specific Instructions:**
- Build the `/users` page (accessible only to Admins).
- Create the modal to invite new users. This must create a user in Supabase Auth AND insert a record into the custom `users` table atomically.
- Implement the functionality to change a user's role.
- Finalize any Admin-level lead capabilities (like global assignment or forcing AI overrides).
- **When Finished:**
  1. Explain how the atomic user creation works and how it handles failures (e.g., Supabase Auth succeeds but DB insert fails).
  2. Remind me how I can set up my very first Admin user directly in Supabase to test this page.

---

## Prompt for Phase 8: Polish & Production
**Agent Context:** The application is feature-complete. This phase is about making it robust, fast, and beautiful for production.

**Task:** Please implement Phase 8 as detailed in `development phases/phase_8.md`.

**Specific Instructions:**
- Do not build new features.
- Audit and refine all `framer-motion` animations, hover states, and transitions.
- Ensure full responsiveness on desktop and tablet views.
- Add necessary database indexes to Supabase.
- Implement error boundaries and graceful API error handling.
- Create a comprehensive `README.md`.
- **When Finished:**
  1. List the database indexes that need to be applied in Supabase.
  2. Provide the final deployment steps for Vercel.
  3. Inform me that the MVP is complete and ready for end-to-end testing!

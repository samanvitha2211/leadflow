# LeadFlow PRD Phase: Lead Details Page

## 1. Overview
The Lead Details Page (`/leads/[id]`) provides an in-depth view of a single lead. It is where team members review AI classifications, read the raw message, execute human overrides, and track the specific status and assignment of the lead.

## 2. Layout & UI Components
*   **Two-Column Grid Layout:**
    *   **Left Column (Lead Context):** Displays the Lead Name, Source, Created Date, and the full Raw Message submitted by the lead.
    *   **Right Column (AI Analysis & Workflow):** Displays the AI's output, current values, and action buttons.

## 3. Implementation Details

### 3.1 AI Analysis Display
*   Displays `ai_category`, `ai_priority`, and `suggested_reply` fields from the database.
*   The UI should visually distinguish these as AI-generated (e.g., using an iridescent border or AI icon).

### 3.2 Human Overrides
*   **Requirement:** Users can override the AI's decisions, but the original AI values must NEVER be overwritten or lost.
*   **Form:** A form allowing the user to select a new Category, Priority, and edit the Suggested Reply.
*   **Database Action:** Submitting an override updates the `current_category`, `current_priority`, and `suggested_reply` fields on the `leads` table.
*   **Audit Logging:** This action triggers an `activity_log` entry recording the old and new values.

### 3.3 Status & Assignment Workflow
*   **Current State:** Displays the current `status` (`new`, `in_progress`, `closed`) and the `assigned_to` user.
*   **Actions:** 
    *   Dropdown to change status.
    *   Dropdown to Assign/Reassign/Unassign the lead.
*   Both actions trigger `PATCH /api/leads/:id` (or specific status/assign endpoints) and log the activity.

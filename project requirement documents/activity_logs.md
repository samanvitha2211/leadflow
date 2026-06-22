# LeadFlow PRD Phase: Activity Audit Log

## 1. Overview
The Activity Audit Log is a core security and accountability feature. Every significant action taken on a lead is recorded immutably, creating a comprehensive timeline of events.

## 2. Requirements & Triggers
An entry must be created in the `activity_log` table when any of the following events occur:
*   Lead Created
*   AI Classified Lead
*   Priority Changed (Human Override)
*   Category Changed (Human Override)
*   Suggested Reply Updated
*   Assigned User Changed
*   Status Updated (e.g., New -> In Progress)
*   Lead Closed
*   Lead Reopened

## 3. Database Schema
```sql
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  user_id uuid references users(id), -- Can be null if action is system/AI
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamp default now()
);
```
*Note: Storing `old_value` and `new_value` as JSONB allows for flexible storage of what precisely changed (e.g., `{"status": "new"}` to `{"status": "in_progress"}`).*

## 4. UI Implementation (`/activity`)
*   **Global View:** A dedicated `/activity` page (accessible by Admins and Managers) that shows a system-wide feed of all actions, sorted by most recent.
*   **Lead-Specific View:** On the Lead Details page (`/leads/[id]`), a specific timeline view showing only the history for that particular lead.
*   **Design:** A vertical timeline connecting "nodes". Each node represents an event, displaying the timestamp, the user who performed it (or "System AI"), the action taken, and the specific change.

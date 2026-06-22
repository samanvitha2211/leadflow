# LeadFlow PRD Phase: Admin Module

## 1. Overview
The Admin Module provides superuser capabilities for the LeadFlow platform. Admins have absolute control over the system, including lead management, overriding AI decisions, and managing the team (users).

## 2. Admin Permissions & Capabilities
An Admin has the following permissions:
*   View all leads in the system.
*   Edit all fields on all leads.
*   Assign or reassign owners to any lead.
*   Manage users (Create, view, and assign roles to team members).
*   View the system-wide activity log.
*   Override AI classification values securely.

## 3. Implementation Details

### 3.1 User Management Page (`/users`)
*   **Access:** Strictly restricted to users with the `admin` role via Next.js Middleware.
*   **UI Components:**
    *   **User Data Table:** Displays all users currently in the system (Name, Email, Role, Created Date).
    *   **Create User Modal:** A form to invite/create a new team member. Requires Name, Email, and a Role selection (`admin` or `manager`).
*   **Integration:** 
    *   When an Admin creates a user, it must create a record in Supabase Auth (triggering an invite email/password setup) AND create a corresponding record in the custom `users` database table.

### 3.2 Lead Management (Admin Level)
*   **Global Assignment:** Admins can click on *any* lead in the dashboard and assign it to a Manager.
*   **Global Overrides:** Admins have the authority to override the AI's `ai_category` and `ai_priority` on the Lead Details page, saving the updated values to `current_category` and `current_priority`.

### 3.3 API Requirements (Admin)
*   `GET /api/users` - Fetch all users.
*   `POST /api/users` - Create a new user (Supabase Auth + DB insert).
*   `PATCH /api/users/:id/role` - Update a user's role.

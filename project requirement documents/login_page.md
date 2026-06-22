# LeadFlow PRD Phase: Authentication & Login Page

## 1. Overview
This module handles secure access to the LeadFlow platform. It ensures that only authorized personnel can access the internal dashboard and restricts access based on user roles (Admin vs. Manager).

## 2. Technical Stack
*   **Authentication Provider:** Supabase Auth
*   **Methods Supported:** Email and Password login
*   **Routing/Security:** Next.js Middleware

## 3. Implementation Details

### 3.1 Login Page UI (`/login`)
*   **Layout:** A centered, glassmorphic login card (as per `design.md`).
*   **Form Fields:** 
    *   Email Address (validated using Zod: must be a valid email format).
    *   Password.
*   **Actions:** "Sign In" button.
*   **Error Handling:** Inline error messages for invalid credentials or malformed inputs.
*   **Redirect:** Upon successful authentication, the user is redirected to `/dashboard`.

### 3.2 Next.js Middleware
*   **Purpose:** Protect all internal routes.
*   **Protected Routes:** `/dashboard`, `/leads/*`, `/settings`, `/users`, `/activity`, `/import`
*   **Logic:**
    1. Intercept incoming requests.
    2. Check for an active Supabase Auth session/cookie.
    3. If no session exists, redirect the user to `/login`.
    4. If a session exists, fetch the user's role from the `users` table.
    5. Perform Role-Based Access Control (RBAC):
        *   If a `Manager` attempts to access `/users`, redirect them to `/dashboard` with an "Unauthorized" toast notification.
        *   Allow `Admins` to access all routes.

### 3.3 Database Integration
*   The system relies on the `users` table for role verification.
```sql
create table users (
  id uuid primary key,
  name text not null,
  email text unique not null,
  role text not null, -- 'admin' or 'manager'
  created_at timestamp default now()
);
```

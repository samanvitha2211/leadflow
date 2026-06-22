# Phase 7: Admin Module & User Management

## Goal
Build the Admin-exclusive section of LeadFlow — the User Management page (`/users`) — giving Admins full control over team composition and role assignments. This phase also finalizes all role-specific capability restrictions that differentiate the Admin and Manager experiences.

---

## 1. Access Control

- The `/users` route is **Admin-only**.
- Next.js Middleware (built in Phase 2) already blocks Manager access.
- Additionally, all API routes in this phase require server-side role verification.

---

## 2. User Management Page (`/users`)

### 2.1 Page Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar  │  Page Title: "User Management"                   │
│           │  ──────────────────────────────────────────────  │
│           │  [ + Invite User ] button (top right)            │
│           │  ──────────────────────────────────────────────  │
│           │  User Data Table                                 │
│           │                                                  │
│           │  Name | Email | Role | Created Date | Actions   │
│           │  ──────────────────────────────────────────────  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 User Data Table
Columns:
| Column        | Display                          |
|---------------|----------------------------------|
| Name          | Full name                        |
| Email         | Email address                    |
| Role          | Badge: "Admin" (Violet) / "Manager" (Blue) |
| Created Date  | Formatted timestamp              |
| Actions       | "Change Role" button             |

- Sorted by `created_at DESC` by default.
- Table uses TanStack Table (consistent with Dashboard).

---

## 3. Invite / Create User Modal

### 3.1 Trigger
Clicking the **"+ Invite User"** button in the top-right opens a glassmorphic `<Dialog>` modal.

### 3.2 Modal Form Fields
- **Full Name** — Required, min 2 characters.
- **Email Address** — Required, valid email format.
- **Role** — Required, `<Select>` with "Admin" or "Manager" options.

### 3.3 Validation
- All fields validated with `react-hook-form` + `zod`.
- Inline errors below each field.

### 3.4 Submit Logic (from `admin_module.md` §3.1)
Calling `POST /api/users` must perform **two operations atomically**:
1. **Create a Supabase Auth user** via the Admin API (`supabase.auth.admin.createUser`) — this triggers an invite/password-setup email.
2. **Insert a record** into the custom `users` table with matching `id`, `name`, `email`, `role`.

If Supabase Auth creation fails → do not insert into `users` table (no orphaned records).
If `users` table insert fails → attempt to delete the created Auth user to rollback.

### 3.5 Modal States
- **Idle:** Form fields empty.
- **Submitting:** Fields disabled, "Inviting..." with spinner on button.
- **Success:** Modal closes, success toast: "User invited successfully. They'll receive a setup email."
- **Error:** Error message shown inside the modal (e.g., "Email already in use").

---

## 4. Change Role Functionality

### 4.1 Trigger
- "Change Role" button in the table's Actions column.
- Opens a small inline popover or a compact modal.

### 4.2 Role Change Modal
- Current role displayed.
- `<Select>` to choose the new role.
- "Update Role" button.

### 4.3 API: `PATCH /api/users/:id/role`
- Body: `{ role: 'admin' | 'manager' }`
- Updates the `users` table `role` column.
- Returns updated user.
- Creates an activity log entry: `action = 'User Role Changed'`.

---

## 5. Admin-Level Lead Capabilities (from `admin_module.md`)

### 5.1 Global Lead Assignment (Dashboard)
- Admins can assign any lead to any user directly from the Dashboard table quick-action.
- "Assign" quick-action button on row hover calls `POST /api/leads/:id/assign`.

### 5.2 AI Override Authority (Lead Details)
- Only Admins see a special **"Force Override AI Values"** toggle on the Human Override form.
- When enabled, the form also shows editable fields for `ai_category` and `ai_priority` (as a power-user escape hatch in exceptional circumstances).
- This is still stored in `current_category` / `current_priority` — the original `ai_*` values remain read-only in the database by design.

---

## 6. API Routes for Admin Module

### `GET /api/users`
- Returns all users from the `users` table.
- Admin-only — server verifies role before returning data.

### `POST /api/users`
- Creates Auth user via Supabase Admin API.
- Inserts into `users` table.
- Returns the new user object.
- Admin-only.

### `PATCH /api/users/:id/role`
- Updates user role.
- Admin-only.
- Logs the role change to activity log.

---

## 7. Manager Restrictions (Finalization)
Confirm all Manager restrictions from `manager_module.md` are working end-to-end:

| Feature                     | Manager Access |
|-----------------------------|----------------|
| `/users` page               | ❌ Redirected  |
| Create new users            | ❌             |
| Change user roles           | ❌             |
| View all leads              | ✅             |
| Assign/Reassign leads       | ✅             |
| Change lead status          | ✅             |
| Override Category/Priority  | ✅             |
| Edit Suggested Reply        | ✅             |
| View Activity Logs          | ✅             |

---

## Acceptance Criteria
- [ ] `/users` page is visible in sidebar and accessible only to Admins.
- [ ] Manager accessing `/users` is redirected to `/dashboard`.
- [ ] User table displays Name, Email, Role badge, Created Date, and Actions.
- [ ] "Invite User" modal opens and validates form fields correctly.
- [ ] Submitting invite creates both a Supabase Auth user AND a `users` table record.
- [ ] Duplicate email shows an error inside the modal.
- [ ] Role change modal works and updates the user's role in the database.
- [ ] Role change is reflected immediately in the table (optimistic update or refetch).
- [ ] Admin can assign any lead to any user from the Dashboard.
- [ ] All Manager restrictions enumerated above are enforced.

# Phase 2: Authentication, RBAC Middleware & Application Shell

## Goal
Implement a secure, role-aware authentication system using Supabase Auth and build the global application shell — the Sidebar, Navbar, and page layout — using the glassmorphism design defined in `design.md`. At the end of this phase, users can log in and navigate a polished, animated shell.

---

## 1. Login Page (`/login`)

### 1.1 Layout & Design (from `design.md` §4.1)
- **Split-screen layout:**
  - **Left Half:** Centered glassmorphic login card.
  - **Right Half:** Abstract animated 3D mesh gradient or data visualization canvas (CSS/SVG animated background).
- **Login Card:**
  - Heavy glassmorphism using the `.glass-panel` utility.
  - Inputs with subtle inner shadow (`box-shadow: inset 0 1px 4px rgba(0,0,0,0.3)`).
  - Primary Electric Violet button with glowing drop-shadow on hover.

### 1.2 Form Implementation
- Use `react-hook-form` + `zod` for validation.
- Fields:
  - **Email Address** — validated for correct email format.
  - **Password** — minimum 8 characters.
- **Actions:**
  - "Sign In" button triggers `supabase.auth.signInWithPassword()`.
- **Error Handling:**
  - Inline error messages below each invalid field (red text, not toast).
  - Catch-all Supabase auth errors displayed inside the card.
- **Success:** Redirect to `/dashboard` on successful sign-in.

### 1.3 UI States
- Loading spinner on the Sign In button while authenticating.
- Button disabled during submission to prevent double-clicks.

---

## 2. Next.js Middleware — RBAC (`/middleware.ts`)

### 2.1 Protected Route List
All internal routes are protected:
```
/dashboard, /leads/*, /import, /activity, /users, /settings
```

### 2.2 Middleware Logic Flow
```
Incoming Request
      ↓
Check Supabase session cookie
      ↓
No Session? → Redirect to /login
      ↓
Session found → Fetch user role from `users` table
      ↓
Role = 'manager' accessing /users?
      → Redirect to /dashboard with Unauthorized toast cookie
      ↓
Allow all other authenticated requests
```

### 2.3 Role-Based Access Control Rules
| Route        | Admin | Manager |
|--------------|-------|---------|
| `/dashboard` | ✅    | ✅      |
| `/leads/*`   | ✅    | ✅      |
| `/import`    | ✅    | ✅      |
| `/activity`  | ✅    | ✅      |
| `/users`     | ✅    | ❌ → redirect `/dashboard` |

### 2.4 Session Refresh
- Use Supabase SSR utilities to refresh session tokens on every request.
- Prevent stale session bugs in long-running tabs.

---

## 3. Application Shell & Global Layout

### 3.1 Root Layout (`/app/layout.tsx`)
- Apply Google Fonts (`Inter` / `Outfit`).
- Set dark background (`#0B0F19`) with subtle radial mesh gradient.
- Wrap children with a `<ThemeProvider>` for dark/light mode toggle.
- Include global `<Toaster>` component for toast notifications.

### 3.2 Authenticated Layout (`/app/(protected)/layout.tsx`)
- Renders **Sidebar** + **Main Content Area** side by side.
- Applies `framer-motion` `<AnimatePresence>` for page transitions.

### 3.3 Sidebar Navigation Component
Design requirements (from `design.md` §4.2):
- Floating, glassmorphic panel using `.glass-panel`.
- Contains:
  - **LeadFlow logo/wordmark** at the top.
  - Navigation links: Dashboard, Leads, Import CSV, Activity Log, Users (Admin only).
  - **Active link:** Highlighted with a primary Electric Violet gradient background pill.
  - **User info footer:** Avatar + name + role badge + sign out button.
- **Hover effect:** Subtle scale and background highlight on nav links.
- Admin-only items (e.g., "Users") are hidden for Manager role — checked from session.

### 3.4 Top Navbar Component
- Displays current page title.
- Right side: Dark/Light mode toggle, user avatar, quick sign-out.
- Glassmorphic background with a `border-bottom` separator.

---

## 4. Page Transition Animations (`framer-motion`)

### 4.1 Page Wrapper Component
```tsx
// Soft fade + slide-up on every page mount
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};
```
Wrap all page content in `<motion.div variants={pageVariants} ...>`.

---

## 5. Reusable UI Components (Phase Foundation)
Build these shared components to be used in all future phases:
- `<Badge>` — Color-coded status/priority/category labels with correct colors.
- `<LoadingSpinner>` — Used in buttons and page loading states.
- `<EmptyState>` — Illustrated empty state card for tables with no data.
- `<ConfirmDialog>` — Glassmorphic modal for destructive action confirmations.
- `<ToastNotification>` — shadcn toast already wired globally.

---

## 6. Sign Out Flow
- Sign-out button calls `supabase.auth.signOut()`.
- Clears session cookies and redirects to `/login`.

---

## Acceptance Criteria
- [ ] Navigating to `/dashboard` when logged out redirects to `/login`.
- [ ] Login with valid credentials redirects to `/dashboard`.
- [ ] Login with invalid credentials shows inline error messages.
- [ ] Manager role attempting to access `/users` is redirected to `/dashboard`.
- [ ] Sidebar renders correctly with role-appropriate nav items.
- [ ] Page transitions animate smoothly between routes.
- [ ] Sign out clears session and redirects to `/login`.

# Phase 5: Lead Details Page & Human Override System

## Goal
Build the deep-dive view for individual leads — the most information-rich page in the application. Users can review the AI's output, override AI decisions (while preserving original AI values), manage lead status, and assign/reassign ownership. Every action is recorded in the activity log.

---

## 1. Lead Details Page Layout (`/leads/[id]`)

### 1.1 Design (from `design.md` §4.3)
Two-column grid layout:

```
┌────────────────────────────┬────────────────────────────┐
│   LEFT COLUMN              │   RIGHT COLUMN             │
│   Lead Context Card        │   AI Analysis Card         │
│   ─────────────────        │   ─────────────────────    │
│   • Lead Name              │   • ai_category (badge)    │
│   • Source Badge           │   • ai_priority (badge)    │
│   • Created Date           │   • suggested_reply        │
│   • Raw Message (full)     │   • "Copy to Clipboard"    │
│                            │   ─────────────────────    │
│                            │   Human Override Form      │
│                            │   ─────────────────────    │
│                            │   Status & Assignment      │
└────────────────────────────┴────────────────────────────┘
│   Activity Timeline (full width, below both columns)    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Left Column — Lead Context Card

### 2.1 Components
- **Lead Name** — Large semibold heading.
- **Source Badge** — "Manual" or "CSV".
- **Created Date** — Formatted timestamp.
- **Status Badge** — Color-coded current status.
- **Assigned To** — User avatar + name (or "Unassigned").
- **Raw Message** — Full text displayed in a dark, monospace-styled card. No truncation.

---

## 3. Right Column — AI Analysis Card

### 3.1 Design (from `design.md` §4.3)
- The card has a **subtle, animated iridescent border** to signal AI-generated content.
- Border uses `gradient-shift` keyframe animation (Purple → Cyan looping).
- A small robot/AI icon (`lucide-react`: `Bot`) in the card header.

### 3.2 AI Data Display
| Field            | Display                          |
|------------------|----------------------------------|
| `ai_category`    | Color-coded badge                |
| `ai_priority`    | Hot/Warm/Cold badge              |
| `suggested_reply`| Styled textarea (read-only mode) |

### 3.3 Suggested Reply Box (from `design.md` §4.3)
- Styled as a modern chat-like interface (rounded corners, speech bubble aesthetic).
- **"Copy to Clipboard" button** — on click:
  1. Text is copied to clipboard.
  2. Button icon changes from `Copy` → `Check` with a green flash animation.
  3. Reverts after 2 seconds.

---

## 4. Human Override Form

### 4.1 Key Invariant (from `prd.md`)
> **The AI's original values (`ai_category`, `ai_priority`) must NEVER be overwritten.**
> Overrides update only `current_category`, `current_priority`, `suggested_reply`.

### 4.2 Form Fields
- **Category Override** — `<Select>` with all 5 category options. Pre-filled with `current_category` (or `ai_category` if no override yet).
- **Priority Override** — `<Select>` with Hot / Warm / Cold. Pre-filled with `current_priority`.
- **Edit Suggested Reply** — Textarea pre-filled with `suggested_reply`. Fully editable.

### 4.3 Validation
- Category and Priority must be selected (not empty).
- Suggested reply can be empty (cleared intentionally).

### 4.4 Submit Action
On "Save Overrides" button click:
1. Call `PATCH /api/leads/:id` with `{ current_category, current_priority, suggested_reply }`.
2. Server updates the three mutable fields only.
3. Server inserts activity log entries for each changed field (old_value → new_value).
4. On success: Show success toast + update displayed values.
5. On error: Show error toast.

### 4.5 Visual Differentiation
Show both values side by side when an override exists:
```
Category:   AI: sales     Current: support  (Override active ✏️)
Priority:   AI: warm      Current: hot      (Override active ✏️)
```

---

## 5. Status & Assignment Workflow

### 5.1 Status Management
- **Display:** Current status badge at the top of the right column.
- **Control:** A shadcn `<Select>` dropdown with all allowed transitions:
  - `new` → `in_progress`
  - `in_progress` → `closed`
  - `closed` → `in_progress` (reopen)
- **On change:** Calls `POST /api/leads/:id/status` with new status, logs activity.

### 5.2 Assignment Management
- **Display:** "Assigned to: [Name]" or "Unassigned".
- **Control:** A `<Select>` populated with all users from the system.
  - Options: All manager/admin users + "Unassign".
- **On change:** Calls `POST /api/leads/:id/assign` with the selected `user_id`, logs activity.

---

## 6. API Routes for Lead Details

### `GET /api/leads/:id`
Returns a single lead with all fields, joined with assigned user info.

### `PATCH /api/leads/:id`
Updates `current_category`, `current_priority`, `suggested_reply`.
- Reads old values before update for activity log.
- Creates activity log entries: `Priority Changed`, `Category Changed`, `Reply Updated`.

### `POST /api/leads/:id/status`
Updates lead `status`.
- Validates state transition is legal.
- Logs: `Status Updated` or `Lead Closed` or `Lead Reopened`.

### `POST /api/leads/:id/assign`
Updates lead `assigned_to`.
- Logs: `Assigned User Changed`.

---

## 7. Lead-Specific Activity Timeline

### 7.1 Location
Displayed in a full-width section below the two-column grid on the Lead Details page.

### 7.2 Design (from `design.md` §4.4)
- A vertical timeline: a thin colored line running top-to-bottom.
- Each event is a **node** — a glassmorphic card attached to the timeline line.
- Node contents:
  - **Timestamp** — Formatted relative time (e.g., "3 hours ago") with full datetime on hover.
  - **Actor** — User avatar + name, or "System AI" with a robot icon.
  - **Action** — Bold action label (e.g., "Priority Changed").
  - **Change Detail** — Old value → New value (e.g., "warm → hot").
- Distinct icons per action type using `lucide-react`:
  - Lead Created → `Plus`
  - AI Classified → `Bot`
  - Priority Changed → `TrendingUp`
  - Category Changed → `Tag`
  - Reply Updated → `MessageSquare`
  - Assigned User Changed → `UserCheck`
  - Status Updated → `RefreshCw`
  - Lead Closed → `CheckCircle`

### 7.3 API
```
GET /api/leads/:id/activity
```
Returns activity log entries for a single lead, sorted by `created_at DESC`.

---

## Acceptance Criteria
- [ ] Lead Details page shows all lead data from the database.
- [ ] AI Analysis card displays ai_category, ai_priority, and suggested_reply.
- [ ] Iridescent animated border renders on the AI card.
- [ ] "Copy to Clipboard" copies text and shows checkmark animation.
- [ ] Human Override form pre-fills with current values.
- [ ] Saving overrides updates `current_category`, `current_priority`, `suggested_reply` only.
- [ ] `ai_category` and `ai_priority` remain unchanged after an override.
- [ ] When override is active, both AI and Current values are shown side by side.
- [ ] Status dropdown shows correct transitions and updates successfully.
- [ ] Assignment dropdown assigns/reassigns/unassigns leads correctly.
- [ ] All actions (override, status change, assignment) create activity log entries with old/new values.
- [ ] Lead-specific activity timeline renders all events in correct order with correct icons.

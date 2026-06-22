# Phase 6: Activity Audit Log (Global View)

## Goal
Build the standalone, system-wide Activity Log page (`/activity`) — a comprehensive, immutable audit trail of every significant action that has occurred across all leads and users in the platform. This is a critical accountability and compliance feature accessible to both Admins and Managers.

---

## 1. Overview

The activity log system was seeded and tested within the context of Phase 5 (Lead Details Timeline). Phase 6 elevates this into a full global view — a system-wide, chronological feed of all events across all leads.

---

## 2. Activity Log Page (`/activity`)

### 2.1 Access Control
- Accessible by: **Admin** and **Manager** roles.
- Blocked from: No restrictions between roles for viewing the global log.

### 2.2 Page Layout
```
┌──────────────────────────────────────────────────────┐
│  Sidebar │  Page Title: "Activity Log"               │
│          │  ───────────────────────────────────────  │
│          │  Filter Controls (Date, Action Type, User)│
│          │  ───────────────────────────────────────  │
│          │  Vertical Timeline Feed                   │
│          │  (Scrollable, paginated)                  │
│          │  ───────────────────────────────────────  │
│          │  Load More / Pagination Controls          │
└──────────────────────────────────────────────────────┘
```

---

## 3. Timeline Design (from `design.md` §4.4)

### 3.1 Visual Style
- A single vertical colored line (Electric Violet gradient) runs the full height of the feed.
- Each event is a **glassmorphic node card** pinned to the line.
- Cards animate in using `framer-motion` with a staggered entrance (fade + slide-left).

### 3.2 Node Card Contents
Each timeline node displays:
| Element           | Detail                                          |
|-------------------|-------------------------------------------------|
| **Timestamp**     | Relative time ("2 hours ago") + full datetime on hover tooltip |
| **Actor Icon**    | User avatar (for human actions) or `Bot` icon (for AI actions) |
| **Actor Name**    | User's full name or "System AI"                 |
| **Action Label**  | Bold, e.g., "Priority Changed"                 |
| **Lead Reference**| Clickable link → `/leads/[id]` (e.g., "Lead: John Doe") |
| **Change Detail** | Old value → New value in a subtle sub-text block |

### 3.3 Action Icons (`lucide-react`)
| Action                  | Icon          | Color              |
|-------------------------|---------------|--------------------|
| Lead Created            | `Plus`        | Electric Violet    |
| AI Classified           | `Bot`         | Cyan (iridescent)  |
| Priority Changed        | `TrendingUp`  | Amber Gold         |
| Category Changed        | `Tag`         | Ice Blue           |
| Reply Updated           | `MessageSquare` | Muted Gray       |
| Assigned User Changed   | `UserCheck`   | Electric Violet    |
| Status Updated          | `RefreshCw`   | Amber Gold         |
| Lead Closed             | `CheckCircle` | Green              |
| Lead Reopened           | `RotateCcw`   | Neon Coral         |

---

## 4. Filter Controls

Three filter controls above the timeline:

### 4.1 Date Range Filter
- A date range picker (using a shadcn `<Calendar>` popover).
- Presets: "Today", "Last 7 Days", "Last 30 Days", "All Time".

### 4.2 Action Type Filter
- Multi-select dropdown of all action types.
- E.g., show only "AI Classified" and "Priority Changed" events.

### 4.3 User Filter
- Select a specific user to see only their actions.
- Includes "System AI" as an option.

---

## 5. Pagination & Performance
- Load 50 activity log entries per page.
- **"Load More" button** at the bottom for infinite-scroll-style pagination.
- Alternatively: Standard pagination with Previous/Next buttons.
- Activity log entries are **read-only** — no editing or deletion allowed.

---

## 6. API Endpoint

### `GET /api/activity`
Query parameters:
```
?page=1
&limit=50
&action_type=Priority+Changed
&user_id=uuid
&date_from=2025-01-01
&date_to=2025-01-31
&lead_id=uuid   ← used by Lead Details page timeline too
```

Response:
```json
{
  "data": [
    {
      "id": "...",
      "lead_id": "...",
      "lead_name": "John Doe",
      "user_id": "...",
      "user_name": "Alice Smith",
      "action": "Priority Changed",
      "old_value": { "priority": "warm" },
      "new_value": { "priority": "hot" },
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1240,
  "page": 1
}
```

The API joins `activity_log` with `leads` (for lead name) and `users` (for actor name).

---

## 7. Empty States
- **No activity yet:** "No activity logged yet. Actions taken on leads will appear here."
- **No results for filters:** "No activity matches your filters." with a "Clear Filters" button.

---

## Acceptance Criteria
- [ ] `/activity` page is accessible to both Admin and Manager roles.
- [ ] All activity log event types are displayed with correct icons and colors.
- [ ] Timeline nodes display: timestamp, actor, action, lead link, and change detail.
- [ ] Clicking a lead reference navigates to the correct `/leads/[id]` page.
- [ ] Date range filter correctly narrows results.
- [ ] Action type filter works for single and multiple selections.
- [ ] User filter shows only actions by the selected user.
- [ ] "System AI" filter shows only AI-generated events.
- [ ] Pagination loads additional entries correctly.
- [ ] Activity log is strictly read-only (no edit/delete buttons visible).
- [ ] Staggered animation plays when entries load.

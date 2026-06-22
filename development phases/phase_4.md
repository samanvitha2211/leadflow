# Phase 4: Dashboard & Data Visualization

## Goal
Build the central hub of LeadFlow — the main Dashboard. It provides a real-time, filterable, sortable view of every lead in the system alongside high-level visual metric graphs. This is the page users spend the most time on and must be both functionally powerful and visually stunning.

---

## 1. Dashboard Layout (`/dashboard`)

### 1.1 Layout Structure
```
┌──────────────────────────────────────────────────┐
│  Sidebar  │  Top Metric Cards Row                │
│           │  ─────────────────────────────────── │
│           │  Search Bar + Filter Controls        │
│           │  ─────────────────────────────────── │
│           │  Lead Data Table (TanStack)          │
│           │  ─────────────────────────────────── │
│           │  Pagination Controls                 │
└──────────────────────────────────────────────────┘
```

### 1.2 Performance Requirements (from `prd.md`)
- Dashboard must load in **< 2 seconds**.
- Search must resolve in **< 500ms**.
- Pagination default: **50 rows per page**.

---

## 2. Metric Graph Cards (Top Section)

### 2.1 Design (from `design.md` §4.2)
- 3–4 glassmorphic cards in a horizontal row at the top.
- Each card has a mini Recharts chart with transparent background and vibrant stroke colors.
- Cards animate in **staggered** using `framer-motion` (each card appears 100ms after the previous).

### 2.2 Chart Components (`/components/charts/`)

#### Card 1: Total Leads Over Time — Line Chart
- **Library:** Recharts `<LineChart>`
- **X-axis:** Dates (last 30 days).
- **Y-axis:** Lead count.
- **Line color:** Electric Violet `#8B5CF6`.
- **Data source:** Aggregate query on `leads.created_at`.

#### Card 2: Leads by Priority — Doughnut Chart
- **Library:** Recharts `<PieChart>` with `innerRadius`.
- **Segments:**
  - Hot → Neon Coral `#FF4D4D`
  - Warm → Amber Gold `#F59E0B`
  - Cold → Ice Blue `#38BDF8`
- **Center label:** Total lead count.

#### Card 3: Leads by Category — Bar Chart
- **Library:** Recharts `<BarChart>`.
- **X-axis:** Categories (sales, support, billing, partnership, other).
- **Bar color:** Gradient from Electric Violet to Cyan (iridescent AI color).

#### Card 4: Leads by Status — Horizontal Bar Chart (Optional)
- Shows New / In Progress / Closed ratios.

### 2.3 API Endpoint for Metrics
```
GET /api/leads/stats
```
Returns aggregated counts needed for all four charts in a single request.

---

## 3. Lead Data Table

### 3.1 Library: TanStack Table + shadcn/ui DataTable

### 3.2 Table Columns (from `prd.md` Dashboard Requirements)
| Column          | Display              | Sortable |
|-----------------|----------------------|----------|
| Lead ID         | Shortened UUID (8 chars) | —    |
| Name            | Full name text       | —        |
| Source          | Badge: Manual / CSV  | —        |
| Category        | Color-coded badge    | —        |
| Priority        | Bold badge: 🔴 Hot / 🟡 Warm / 🔵 Cold | ✅ |
| Status          | Badge: New / In Progress / Closed | ✅ |
| Assigned Owner  | Avatar + name        | —        |
| Created Date    | `Jan 15, 2025 10:00 AM` | ✅     |

### 3.3 Badge Color Reference
| Value       | Color            | Hex       |
|-------------|------------------|-----------|
| Hot         | Neon Coral       | `#FF4D4D` |
| Warm        | Amber Gold       | `#F59E0B` |
| Cold        | Ice Blue         | `#38BDF8` |
| New         | Electric Violet  | `#8B5CF6` |
| In Progress | Amber Gold       | `#F59E0B` |
| Closed      | Muted Gray       | `#6B7280` |
| Manual      | White/Outlined   |           |
| CSV         | Cyan             | `#22D3EE` |

### 3.4 Row Interactions (from `design.md` §4.2)
- **Hover effect:** Row highlights with soft glass overlay and translates `+1px` to the right (`translate-x-1`).
- **Hover reveals:** Quick-action buttons appear on row right side:
  - **Assign** → Opens assignment dropdown.
  - **View** → Navigates to `/leads/[id]`.
- **Row click:** Navigates to `/leads/[id]`.

### 3.5 Staggered Row Loading Animation
When the table loads, rows animate in sequentially with a `framer-motion` staggered delay (each row 30ms after the previous).

---

## 4. Search, Sort & Filter Controls

### 4.1 Global Search Bar
- Positioned above the table.
- Debounced input (300ms) to avoid excessive API calls.
- Searches across: `name`, `raw_text`, `current_category`.
- Clears with an ✕ button.

### 4.2 Filter Dropdowns
Five filter controls, each using shadcn `<Select>`:
1. **Status** — New / In Progress / Closed
2. **Priority** — Hot / Warm / Cold
3. **Category** — Sales / Support / Billing / Partnership / Other
4. **Assigned User** — Dropdown populated from `users` table
5. **Source** — Manual / CSV

- Active filters show a badge count next to "Filters" label.
- **"Clear All Filters"** button appears when any filter is active.

### 4.3 Column Sorting
- Clickable column headers for: Created Date, Priority, Status.
- Shows ↑ / ↓ / ⇅ sort indicators in the column header.

---

## 5. API Integration

### 5.1 `GET /api/leads` — Paginated & Filtered
Query parameters supported:
```
?page=1
&limit=50
&status=new
&priority=hot
&category=sales
&assigned_to=uuid
&source=csv
&search=keyword
&sort_by=created_at
&sort_dir=desc
```

**Server-side Logic:**
1. Start with base Supabase query on `leads` joined with `users` (for assigned owner name).
2. Dynamically apply filters only when parameters are present.
3. Apply full-text search via `ilike` on `name`, `raw_text`, `current_category`.
4. Apply pagination with `.range(offset, offset + limit - 1)`.
5. Return: `{ data: Lead[], total: number, page: number }`.

### 5.2 Pagination Controls
- Previous / Next buttons.
- Current page indicator: "Showing 1–50 of 347 leads".
- Jump-to-page input for large datasets.

---

## 6. Empty & Loading States
- **Loading:** Table skeleton (TanStack table rows with shimmer animation).
- **Empty (no leads):** Illustrated empty state: "No leads yet — import your first leads or create one manually" with action buttons.
- **Empty (filtered):** "No leads match your filters" with "Clear Filters" button.

---

## Acceptance Criteria
- [ ] Dashboard loads and displays all leads within 2 seconds.
- [ ] All three metric charts render with correct data.
- [ ] Metric cards animate in with stagger on load.
- [ ] Table shows all 8 required columns.
- [ ] Priority/Status/Category badges display correct colors.
- [ ] Row hover effect and quick-action buttons work correctly.
- [ ] All 5 filter dropdowns correctly filter the table data.
- [ ] Global search filters results within 500ms.
- [ ] Column sorting on Created Date, Priority, and Status works correctly.
- [ ] Pagination loads correct pages of data.
- [ ] Empty states display for no data and no filtered results.

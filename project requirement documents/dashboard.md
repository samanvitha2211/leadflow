# LeadFlow PRD Phase: Dashboard Module

## 1. Overview
The Dashboard is the central hub of LeadFlow (`/`). It provides a comprehensive, sortable, and filterable view of all leads in the system, along with high-level metrics.

## 2. UI/UX Requirements
*   **Design:** Modern SaaS interface, utilizing glassmorphism, responsive data tables, and dynamic charts (as per `design.md`).
*   **Performance:** Must load in < 2 seconds. Search must resolve in < 500ms. Pagination defaults to 50 rows per page.

## 3. Implementation Details

### 3.1 Metric Graphs (Top Section)
*   **Library:** Recharts.
*   **Components:** 3-4 glassmorphic cards at the top of the dashboard displaying aggregate data:
    *   Total Leads over time (Line chart).
    *   Leads by Priority (Doughnut chart: Hot, Warm, Cold).
    *   Leads by Category (Bar chart).

### 3.2 The Data Table
*   **Library:** TanStack Table + shadcn/ui.
*   **Columns:**
    *   Lead ID (Shortened UUID)
    *   Name
    *   Source (e.g., Manual, CSV)
    *   Category (Color-coded badge)
    *   Priority (Color-coded badge: Coral, Amber, Blue)
    *   Status (New, In Progress, Closed)
    *   Assigned Owner (Avatar/Name)
    *   Created Date (Formatted)

### 3.3 Search, Sort, and Filter Functionality
*   **Global Search:** A search bar that filters the table based on the `name`, `raw_text` (message), or `category` fields.
*   **Filters:** Dropdown selectors to filter the table by:
    *   Status
    *   Priority
    *   Category
    *   Assigned User
    *   Source
*   **Sorting:** Clickable column headers to sort by:
    *   Created Date (Ascending/Descending)
    *   Priority (Hot -> Cold)
    *   Status

### 3.4 API Integration
*   `GET /api/leads?page=1&limit=50&status=new...`
*   The API route handler must dynamically construct Supabase queries based on the provided search and filter parameters to ensure performant pagination.

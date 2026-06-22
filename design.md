# LeadFlow UI/UX Design Specification

This document serves as the comprehensive design system and UI/UX specification for the **LeadFlow** platform, based on the Product Requirements Document (PRD).

## 1. Design Philosophy

LeadFlow will utilize a **Classic Modern UI** characterized by:
*   **Glassmorphism:** Extensive use of translucent surfaces with backdrop blurs to create depth and a premium feel.
*   **Colorful & Vibrant:** A bold, saturated color palette for data visualization and status indicators, ensuring the app feels lively rather than sterile.
*   **Fluid Animations:** Purposeful micro-animations and page transitions to make the platform feel responsive and alive.
*   **Data-Dense yet Clean:** Utilizing modern spacing and typography to display dense CRM data without overwhelming the user.

---

## 2. Global Design System

### 2.1 Typography
*   **Primary Font:** `Inter` or `Outfit` (Google Fonts).
*   **Weights:** 
    *   Regular (400) for body text.
    *   Medium (500) for buttons and table headers.
    *   Semibold (600) for page titles and card headers.

### 2.2 Color Palette (Dark Mode Optimized)
The platform will support both Light and Dark modes, but the primary aesthetic will lean towards a sleek Dark Mode.

*   **Background:** 
    *   Dark: Deep Indigo/Navy (`#0B0F19`) with subtle radial mesh gradients.
    *   Light: Off-white (`#F8FAFC`) with soft pastel gradient backgrounds.
*   **Glass Panels (Cards/Sidebar):**
    *   Dark: `rgba(255, 255, 255, 0.03)` with a `backdrop-blur-xl` and a `1px` subtle white/gray border (`rgba(255,255,255,0.1)`).
*   **Accents (Colorful):**
    *   **Primary:** Electric Violet (`#8B5CF6`) - Used for primary actions.
    *   **Hot Priority:** Neon Coral (`#FF4D4D`).
    *   **Warm Priority:** Amber Gold (`#F59E0B`).
    *   **Cold Priority:** Ice Blue (`#38BDF8`).
    *   **AI Indicators:** An iridescent gradient (Purple to Cyan) to denote AI-generated content or actions.

### 2.3 Glassmorphism Implementation (TailwindCSS)
All major containers (Sidebar, Navbar, Data Cards) should use the following Tailwind utility pattern:
`bg-white/5 dark:bg-black/20 backdrop-blur-lg border border-white/10 dark:border-white/5 shadow-xl`

---

## 3. Animation Strategy

To make the app feel alive, we will integrate `framer-motion` alongside Tailwind CSS transitions.

*   **Hover Effects:** 
    *   Buttons will have a slight scale-up effect (`scale-105`) and an increased shadow/glow on hover.
    *   Table rows will highlight with a soft glass overlay and translate slightly to the right (`translate-x-1`).
*   **Page Transitions:** 
    *   Soft fade and slide-up (`opacity-0 translate-y-4` to `opacity-100 translate-y-0`) when navigating between the Dashboard, Lead Details, and Activity logs.
*   **Staggered Loading:** 
    *   When the dashboard loads, the metric cards and table rows should animate in sequentially.
*   **AI Processing States:** 
    *   When the AI is classifying a lead, use a glowing, pulsing border animation around the lead card.

---

## 4. Page Layouts & Component Design

### 4.1 Login Page
*   **Layout:** Split screen. Left side contains the glassmorphic login card. Right side features an abstract, colorful 3D mesh gradient or data visualization animation.
*   **Card:** Heavy glassmorphism. Inputs have a subtle inner shadow. 
*   **Button:** Vibrant primary color with a glowing drop-shadow.

### 4.2 Main Dashboard
*   **Sidebar Navigation:** 
    *   A floating, glassmorphic sidebar on the left.
    *   Active links are highlighted with the primary gradient.
*   **Top Metric Graph Cards (Colorful & Visual):**
    *   Although analytics are a "stretch feature" in the PRD, the dashboard *must* look modern. Include 3-4 glass cards at the top displaying mini-graphs (using `Recharts`):
        *   *Total Leads (Line Chart)*
        *   *Leads by Priority (Doughnut Chart - Coral, Amber, Blue)*
        *   *Leads by Category (Bar Chart)*
*   **The Data Table (TanStack Table + shadcn/ui):**
    *   **Header:** Sticky top, slightly darker glass background.
    *   **Badges:** Use bright, solid colors for Priority and Status tags to make them pop against the dark background.
    *   **Actions:** Hovering over a row reveals quick-action buttons (Assign, Change Status).

### 4.3 Lead Details Page (`/leads/[id]`)
*   **Layout:** Two-column grid.
    *   **Left Column (Lead Data):** A large glass card containing the Lead's Name, Source, and the raw message.
    *   **Right Column (AI & Actions):** 
        *   **AI Analysis Card:** This card should have a subtle, animated iridescent border to signify it's AI-powered. It displays the AI Category, AI Priority, and the Suggested Reply.
        *   **Human Override Form:** A clean form to override the AI values, with an "Update" button.
*   **Suggested Reply Box:** A text area that looks like a modern chat interface. Includes a "Copy to Clipboard" button with a success checkmark animation.

### 4.4 Activity Log Page (`/activity`)
*   **Layout:** A vertical timeline view.
*   **Design:** A sleek vertical line connecting nodes. Each node is a glass card detailing the event (e.g., "AI Classified Lead", "Priority Changed").
*   **Icons:** Use colorful, distinct icons for different actions (e.g., a robot icon for AI actions, a user icon for assignment).

### 4.5 Modals & Dialogs
*   **CSV Import Modal:** 
    *   A drag-and-drop zone with a dashed border that glows when a file is hovered over it.
    *   Once uploaded, displays a smooth progress bar animation followed by a colorful summary (Imported vs. Failed).

---

## 5. UI/UX Development Guidelines for the Agent

When building this UI, the AI Agent must follow these steps:

1.  **Initialize shadcn/ui:** Ensure the `theme.css` is configured with the custom color palette (Electric Violet, Neon Coral, etc.).
2.  **Tailwind Configuration:** Add custom animations (e.g., `pulse-glow`, `gradient-shift`) and extend the color palette in `tailwind.config.ts`.
3.  **Component Library:** Rely heavily on `shadcn/ui` for the base accessibility and functionality of Tables, Dialogs, Selects, and Inputs, but **heavily override the styles** to apply the Glassmorphic and Colorful requirements.
4.  **Charting:** Integrate `recharts` for the dashboard visualizations. Ensure the charts use transparent backgrounds and stroke colors that match our vibrant palette.
5.  **Icons:** Use `lucide-react`.

---
*This design document ensures the final LeadFlow product is not only functional but visually stunning, feeling like a premium, state-of-the-art AI application.*

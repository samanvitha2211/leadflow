# PRD: LeadFlow – AI Lead Management & Automation Platform

## Project Overview

Build a full-stack SaaS-style internal lead management application called **LeadFlow**.

The application receives incoming leads from multiple sources, uses AI to automatically classify and prioritize them, allows team members to manage and process leads, and maintains a complete audit trail of all actions.

The system must support:

* AI-powered lead classification
* AI-generated reply suggestions
* Human review and overrides
* Lead assignment
* Status tracking
* Activity logging
* Authentication and role management
* Search and filtering

---

# Technology Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* TailwindCSS
* shadcn/ui
* React Hook Form
* Zod Validation
* TanStack Table

## Backend

* Next.js Server
* Route Handlers
* TypeScript

## Database

* Supabase PostgreSQL

## Authentication

* Supabase Auth

## AI Provider

Implement provider abstraction.

Support:

* OpenAI
* Groq
* Gemini

Provider selectable through environment variables.

## Deployment

* Vercel

---

# Core Business Flow

```text
Lead Submitted
      ↓
Stored in Database
      ↓
AI Classification
      ↓
AI Returns JSON
      ↓
Lead Updated
      ↓
Displayed in Dashboard
      ↓
Human Reviews
      ↓
Assign Owner
      ↓
Update Status
      ↓
Close Lead
      ↓
Activity Log Created
```

---

# User Roles

## Admin

Permissions:

* View all leads
* Edit all leads
* Assign owners
* Manage users
* View activity logs
* Override AI values

---

## Manager

Permissions:

* View all leads
* Assign leads
* Change status
* View activity logs

---

# Database Schema

## users

```sql
create table users (
  id uuid primary key,
  name text not null,
  email text unique not null,
  role text not null,
  created_at timestamp default now()
);
```

Roles:

* admin
* manager

---

## leads

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  source text not null,

  raw_text text not null,

  ai_category text,
  ai_priority text,

  current_category text,
  current_priority text,

  suggested_reply text,

  status text default 'new',

  assigned_to uuid references users(id),

  created_at timestamp default now(),

  updated_at timestamp default now()
);
```

---

## activity_log

```sql
create table activity_log (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid references leads(id),

  user_id uuid references users(id),

  action text not null,

  old_value jsonb,

  new_value jsonb,

  created_at timestamp default now()
);
```

---

# Lead Sources

## Manual Entry

User manually enters:

* Name
* Message

---

## CSV Upload

Accepted columns:

```csv
name,message
John,Need pricing
Sarah,Interested in demo
```

Requirements:

* Validate CSV
* Skip invalid rows
* Show import summary

Example:

```text
100 rows processed
95 imported
5 failed
```

---

## Future Sources

Design architecture for:

* Email intake
* Webhooks
* CRM integrations

Do not implement now.

---

# AI Classification Engine

## Input

Lead raw text.

Example:

```text
Need pricing for 500 employees.
Can we schedule a demo?
```

---

## AI Output Schema

AI must return:

```json
{
  "category": "sales",
  "priority": "hot",
  "suggested_reply": "Thank you for your interest..."
}
```

---

## Categories

Allowed values:

```text
sales
support
billing
partnership
other
```

---

## Priorities

Allowed values:

```text
hot
warm
cold
```

---

## Validation

Use Zod schema.

```typescript
{
 category: string
 priority: string
 suggested_reply: string
}
```

---

## Error Handling

If AI returns invalid JSON:

1. Retry once
2. Retry twice
3. Use fallback

Fallback:

```json
{
  "category": "other",
  "priority": "warm",
  "suggested_reply": ""
}
```

Never crash application.

Log AI failure.

---

# Dashboard Requirements

## Main Dashboard

Display leads in a data table.

Columns:

* Lead ID
* Name
* Source
* Category
* Priority
* Status
* Assigned Owner
* Created Date

---

## Filters

Required filters:

* Status
* Priority
* Category
* Assigned User
* Source

---

## Search

Global search.

Search fields:

* Name
* Message
* Category

---

## Sorting

Support sorting:

* Created Date
* Priority
* Status

---

# Lead Details Page

Route:

```text
/leads/[id]
```

Display:

## Lead Information

* Name
* Source
* Message

---

## AI Analysis

Display:

* AI Category
* AI Priority
* Suggested Reply

---

## Current Values

Display:

* Current Category
* Current Priority
* Assigned Owner
* Status

---

# Human Override Requirements

Users may override:

* Category
* Priority
* Suggested Reply

Important:

Never overwrite AI values.

Store separately.

Example:

```text
AI Priority: Warm
Current Priority: Hot
```

Maintain both values.

---

# Lead Assignment

Managers/Admins can assign leads.

Actions:

```text
Assign User
Reassign User
Unassign User
```

Every assignment creates activity log.

---

# Status Workflow

Allowed statuses:

```text
new
in_progress
closed
```

Workflow:

```text
new
 ↓
in_progress
 ↓
closed
```

Allow reopening.

```text
closed
 ↓
in_progress
```

---

# Activity Log Requirements

Every significant action must create log record.

Examples:

Lead Created

AI Classified

Priority Changed

Category Changed

Reply Updated

Assigned User Changed

Status Updated

Lead Closed

Lead Reopened

---

# Activity Log UI

Display timeline:

```text
10:05 AM
Lead Created

10:06 AM
AI Classified Lead

10:10 AM
Assigned to Alice

10:30 AM
Priority Changed
Warm → Hot

11:00 AM
Status Changed
New → In Progress
```

---

# Authentication

Use Supabase Auth.

Supported:

* Email Login
* Password Login

Protected Routes:

```text
/dashboard
/leads/*
/settings
/users
```

---

# Authorization

Middleware required.

Role-based access.

Example:

Manager cannot access user management.

---

# Required Pages

## Authentication

```text
/login
```

---

## Dashboard

```text
/
```

Lead overview.

---

## Leads

```text
/leads
```

All leads.

---

## Lead Details

```text
/lead/[id]
```

Single lead view.

---

## Create Lead

```text
/leads/new
```

Manual creation form.

---

## Import CSV

```text
/import
```

CSV upload page.

---

## Activity Logs

```text
/activity
```

System-wide audit history.

---

## User Management

```text
/users
```

Admin only.

---

# API Requirements

## Create Lead

POST

```text
/api/leads
```

---

## Get Leads

GET

```text
/api/leads
```

---

## Get Lead

GET

```text
/api/leads/:id
```

---

## Update Lead

PATCH

```text
/api/leads/:id
```

---

## Assign Lead

POST

```text
/api/leads/:id/assign
```

---

## Change Status

POST

```text
/api/leads/:id/status
```

---

## Upload CSV

POST

```text
/api/import
```

---

# UI Design Requirements

Design style:

Modern SaaS Dashboard

Use:

* shadcn/ui
* clean spacing
* card layouts
* responsive design

Theme:

* Light mode
* Dark mode

Required Components:

* Sidebar
* Top Navigation
* Data Tables
* Modal Dialogs
* Toast Notifications
* Loading States
* Empty States

---

# Performance Requirements

Dashboard load:

< 2 seconds

Lead search:

< 500ms

AI classification:

< 10 seconds

Pagination required.

Default:

50 rows per page.

---

# MVP Acceptance Criteria

Application is complete when:

✓ User can login

✓ User can create lead

✓ User can upload CSV

✓ AI classifies lead

✓ AI generates reply

✓ Leads appear in dashboard

✓ Leads can be assigned

✓ Leads can be filtered

✓ Leads can be searched

✓ Leads can be updated

✓ Activity logs are generated

✓ Status can be changed

✓ Human overrides are supported

✓ Audit trail remains intact

✓ Role permissions work

✓ Responsive UI works on desktop and tablet

✓ Application deploys successfully on Vercel

---

# Stretch Features (Do Not Build in MVP)

* Email sending
* Gmail integration
* Outlook integration
* Slack notifications
* Lead analytics dashboard
* AI lead scoring
* Auto follow-ups
* CRM integrations
* Webhook intake
* Multi-tenant organizations
* Team performance reporting

---

# Deliverables

The agent must generate:

1. Complete Next.js application
2. Supabase schema and migrations
3. Authentication flow
4. AI service abstraction layer
5. Dashboard UI
6. Activity logging system
7. CSV import functionality
8. Role-based access control
9. Responsive design
10. Deployment documentation
11. Environment variable setup guide
12. README with local setup instructions

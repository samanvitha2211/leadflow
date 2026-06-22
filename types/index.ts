// ============================================================
// LeadFlow — Global TypeScript Types
// ============================================================

export type Role = 'admin' | 'manager';
export type LeadStatus = 'new' | 'in_progress' | 'closed';
export type LeadCategory = 'sales' | 'support' | 'billing' | 'partnership' | 'other';
export type LeadPriority = 'hot' | 'warm' | 'cold';
export type LeadSource = 'manual' | 'csv';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  source: LeadSource;
  raw_text: string;

  // Immutable AI outputs
  ai_category: LeadCategory | null;
  ai_priority: LeadPriority | null;

  // Mutable human overrides
  current_category: LeadCategory | null;
  current_priority: LeadPriority | null;
  suggested_reply: string | null;

  status: LeadStatus;
  assigned_to: string | null;

  created_at: string;
  updated_at: string;

  // Joined fields (from API)
  assigned_user?: User | null;
}

export interface ActivityLog {
  id: string;
  lead_id: string | null;
  user_id: string | null;
  action: ActivityAction;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;

  // Joined fields (from API)
  lead?: { id: string; name: string } | null;
  actor?: User | null;
}

export type ActivityAction =
  | 'Lead Created'
  | 'AI Classified'
  | 'Priority Changed'
  | 'Category Changed'
  | 'Reply Updated'
  | 'Assigned User Changed'
  | 'Status Updated'
  | 'Lead Closed'
  | 'Lead Reopened'
  | 'User Role Changed';

// ── API Response shapes ──────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  code?: string;
}

// ── AI Classification ────────────────────────────────────────

export interface AIClassificationResult {
  category: LeadCategory;
  priority: LeadPriority;
  suggested_reply: string;
}

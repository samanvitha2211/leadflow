-- Database Indexes for Performance Optimization

-- Leads table indexes for common query patterns and filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads (current_priority);
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads (current_category);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- Activity log indexes for faster timeline rendering and filtering
CREATE INDEX IF NOT EXISTS idx_activity_log_lead_id ON activity_log (lead_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log (action);

-- Drop existing case_updates table if it exists
DROP TABLE IF EXISTS case_updates CASCADE;

-- Create case_updates table
CREATE TABLE IF NOT EXISTS case_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES users(id),
  update_type TEXT NOT NULL,
  message TEXT,
  old_status TEXT,
  new_status TEXT,
  attachments JSONB[] DEFAULT ARRAY[]::JSONB[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_update_type CHECK (update_type IN ('status_change', 'comment', 'assignment', 'evidence_added', 'other'))
);

-- Add explicit foreign key names for better error messages and management
ALTER TABLE case_updates
  ADD CONSTRAINT fk_case_updates_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_case_updates_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);

-- Create indexes for better query performance
CREATE INDEX idx_case_updates_case_id ON case_updates(case_id);
CREATE INDEX idx_case_updates_updated_by ON case_updates(updated_by);
CREATE INDEX idx_case_updates_created_at ON case_updates(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_case_updates_updated_at
    BEFORE UPDATE ON case_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
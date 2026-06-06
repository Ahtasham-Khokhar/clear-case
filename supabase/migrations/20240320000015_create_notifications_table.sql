-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  case_id UUID REFERENCES cases(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('case_update', 'case_created', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_case_id ON notifications(case_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::uuid)
WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid()::uuid);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 
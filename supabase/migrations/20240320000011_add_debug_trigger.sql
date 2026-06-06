-- Create a table to store debug logs
CREATE TABLE IF NOT EXISTS debug_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT,
  operation TEXT,
  user_id TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a function to log debug information
CREATE OR REPLACE FUNCTION log_cases_debug()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO debug_logs (table_name, operation, user_id, data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid()::text,
    jsonb_build_object(
      'new_data', row_to_json(NEW),
      'current_user', auth.jwt(),
      'current_role', current_user
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS cases_debug_trigger ON cases;
CREATE TRIGGER cases_debug_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION log_cases_debug();

-- Grant permissions on debug_logs
GRANT ALL ON debug_logs TO authenticated;
GRANT ALL ON debug_logs TO anon; 
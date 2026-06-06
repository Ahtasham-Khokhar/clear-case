-- First, remove all existing policies on the cases table
DO $$ 
BEGIN
  -- Drop all policies on the cases table
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'cases'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON cases', pol.policyname);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for testing
CREATE POLICY "Enable all access for authenticated users"
ON cases
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- After confirming this works, we can add these more restrictive policies:
/*
-- Policy for citizens to create and view their own cases
CREATE POLICY "Citizens can manage their cases"
ON cases
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()::uuid
    AND users.role = 'citizen'
    AND users.id = citizen_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()::uuid
    AND users.role = 'citizen'
    AND users.id = citizen_id
  )
);

-- Policy for police to view and update cases
CREATE POLICY "Police can manage cases"
ON cases
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()::uuid
    AND users.role = 'police'
  )
);
*/ 
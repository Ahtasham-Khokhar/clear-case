-- First, remove all existing policies on the cases table
DO $$ 
DECLARE
  pol record;
BEGIN
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

-- Create separate policies for each operation
CREATE POLICY "Allow insert for authenticated users"
ON cases
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users"
ON cases
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow update for authenticated users"
ON cases
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow delete for authenticated users"
ON cases
FOR DELETE
TO authenticated
USING (true);

-- Verify the policies are created
DO $$
DECLARE
  pol record;
BEGIN
  RAISE NOTICE 'Current policies on cases table:';
  FOR pol IN 
    SELECT * FROM pg_policies WHERE tablename = 'cases'
  LOOP
    RAISE NOTICE 'Policy: % (%) for %', pol.policyname, pol.cmd, pol.roles;
  END LOOP;
END $$; 
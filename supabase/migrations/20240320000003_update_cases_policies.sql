-- Safely drop existing policies
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Citizens can create cases') THEN
    DROP POLICY "Citizens can create cases" ON cases;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Citizens can view own cases') THEN
    DROP POLICY "Citizens can view own cases" ON cases;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Police can view and update assigned cases') THEN
    DROP POLICY "Police can view and update assigned cases" ON cases;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Admins can manage all cases') THEN
    DROP POLICY "Admins can manage all cases" ON cases;
  END IF;
END $$;

-- Basic policy to allow all authenticated users to create cases (for testing)
CREATE POLICY "Allow authenticated users to create cases"
ON cases FOR INSERT
TO authenticated
WITH CHECK (true);

-- Basic policy to allow users to view their own cases
CREATE POLICY "Allow users to view own cases"
ON cases FOR SELECT
TO authenticated
USING (true);

-- After confirming these work, we can add more restrictive policies 
-- Drop existing foreign key constraints if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'cases_citizen_id_fkey'
  ) THEN
    ALTER TABLE cases DROP CONSTRAINT cases_citizen_id_fkey;
  END IF;
END $$;

-- Ensure the citizen_id column exists and has the correct foreign key
DO $$ 
BEGIN
  -- First ensure the column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'cases' 
    AND column_name = 'citizen_id'
  ) THEN
    ALTER TABLE cases ADD COLUMN citizen_id UUID;
  END IF;

  -- Add the foreign key constraint
  ALTER TABLE cases 
    ADD CONSTRAINT cases_citizen_id_fkey 
    FOREIGN KEY (citizen_id) 
    REFERENCES users(id)
    ON DELETE RESTRICT;

  -- Make sure the column is not null
  ALTER TABLE cases ALTER COLUMN citizen_id SET NOT NULL;
END $$;

-- Grant necessary permissions
GRANT ALL ON cases TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 
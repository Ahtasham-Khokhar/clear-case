-- Check and fix the users table structure
DO $$ 
BEGIN
  -- Create the users table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      auth_user_id UUID UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'citizen',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;

  -- Add any missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'auth_user_id') THEN
    ALTER TABLE users ADD COLUMN auth_user_id UUID UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'citizen';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
    ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users table
CREATE POLICY "Users can view their own profile"
ON users FOR ALL
TO authenticated
USING (auth_user_id = auth.uid()::uuid)
WITH CHECK (auth_user_id = auth.uid()::uuid);

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 
-- First ensure the police_stations table exists
CREATE TABLE IF NOT EXISTS police_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drop existing foreign key if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_station_id_fkey'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_station_id_fkey;
  END IF;
END $$;

-- Add station_id to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'station_id'
  ) THEN
    ALTER TABLE users ADD COLUMN station_id UUID;
  END IF;

  -- Add badge_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'badge_number'
  ) THEN
    ALTER TABLE users ADD COLUMN badge_number TEXT;
  END IF;

  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add the foreign key constraint with explicit name
ALTER TABLE users 
ADD CONSTRAINT users_station_id_fkey 
FOREIGN KEY (station_id) 
REFERENCES police_stations(id);

-- Enable RLS on police_stations table
ALTER TABLE police_stations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view police stations" ON police_stations;
DROP POLICY IF EXISTS "Police can view their assigned station" ON police_stations;
DROP POLICY IF EXISTS "Admin can manage police stations" ON police_stations;

-- Create policies for police_stations table
CREATE POLICY "Police can view their assigned station"
ON police_stations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.station_id = police_stations.id
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admin can manage police stations"
ON police_stations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Grant permissions
GRANT ALL ON police_stations TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 
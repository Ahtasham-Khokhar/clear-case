-- Drop existing cases table if it exists
DROP TABLE IF EXISTS cases CASCADE;

-- Update cases table structure
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  case_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  citizen_id UUID NOT NULL REFERENCES users(id),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reporter_phone TEXT,
  reporter_address TEXT,
  assigned_officer_id UUID REFERENCES users(id),
  assigned_station_id UUID REFERENCES police_stations(id),
  incident_date TIMESTAMP WITH TIME ZONE,
  incident_location TEXT,
  incident_latitude DOUBLE PRECISION,
  incident_longitude DOUBLE PRECISION,
  witness_details TEXT,
  evidence_files TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_case_type CHECK (case_type IN ('theft', 'assault', 'fraud', 'vandalism', 'domestic_violence', 'traffic_violation', 'cybercrime', 'other')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'assigned', 'investigating', 'resolved', 'closed', 'rejected'))
);

-- Add explicit foreign key names for better error messages and management
ALTER TABLE cases
  ADD CONSTRAINT fk_cases_citizen FOREIGN KEY (citizen_id) REFERENCES users(id),
  ADD CONSTRAINT fk_cases_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
  ADD CONSTRAINT fk_cases_officer FOREIGN KEY (assigned_officer_id) REFERENCES users(id),
  ADD CONSTRAINT fk_cases_station FOREIGN KEY (assigned_station_id) REFERENCES police_stations(id);

-- Create indexes for better query performance
CREATE INDEX idx_cases_citizen_id ON cases(citizen_id);
CREATE INDEX idx_cases_reporter_id ON cases(reporter_id);
CREATE INDEX idx_cases_assigned_officer_id ON cases(assigned_officer_id);
CREATE INDEX idx_cases_assigned_station_id ON cases(assigned_station_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
-- Function to generate unique case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_case_number text;
  year text := to_char(current_date, 'YY');
  sequence_num int;
BEGIN
  -- Get the next sequence number for the current year
  SELECT COALESCE(MAX(SUBSTRING(case_number FROM '\d+$')::integer), 0) + 1
  INTO sequence_num
  FROM cases
  WHERE case_number LIKE concat(year, '-%');
  
  -- Format: YY-XXXXX (e.g., 24-00001)
  new_case_number := concat(year, '-', LPAD(sequence_num::text, 5, '0'));
  
  RETURN new_case_number;
END;
$$; 
-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS generate_case_number();

-- Create a simpler case number generation function
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CONCAT(
    TO_CHAR(CURRENT_DATE, 'YY'),
    '-',
    LPAD(
      COALESCE(
        (SELECT COUNT(*) + 1 FROM cases 
         WHERE SUBSTRING(case_number, 1, 2) = TO_CHAR(CURRENT_DATE, 'YY'))::text,
        '1'
      ),
      5,
      '0'
    )
  );
$$; 
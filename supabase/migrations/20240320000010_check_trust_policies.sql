-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON cases TO authenticated;
GRANT ALL ON users TO authenticated;

-- Reset the owner of the cases table to ensure proper permissions
ALTER TABLE cases OWNER TO authenticated;

-- Verify current permissions
DO $$
BEGIN
  RAISE NOTICE 'Current permissions on cases table:';
  FOR perm IN 
    SELECT grantee, privilege_type 
    FROM information_schema.role_table_grants 
    WHERE table_name = 'cases'
  LOOP
    RAISE NOTICE 'Grantee: %, Privilege: %', perm.grantee, perm.privilege_type;
  END LOOP;
END $$; 
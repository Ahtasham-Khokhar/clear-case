-- Create policy for users table to allow public/anonymous inserts during registration
-- Since the server-side API handler inserts the newly registered user's profile,
-- it runs under the anon client role, so it needs permission to insert.
CREATE POLICY "Enable insert for registration"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

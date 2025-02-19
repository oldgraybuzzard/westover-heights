-- First, drop the existing policy
DROP POLICY IF EXISTS "Users can view their own payment history" ON payment_history;

-- Then recreate it with the correct permissions
CREATE POLICY "Users can view their own payment history"
ON payment_history
FOR SELECT
USING (
  -- Allow users to see their own payments
  auth.uid() = user_id
  OR 
  -- Allow admins to see all payments
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND 'ADMIN' = ANY(roles)
  )
);

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'payment_history'; 
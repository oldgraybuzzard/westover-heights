-- Enable RLS on payment_history table
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Add policy for viewing payment history
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
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  payment_intent_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  posts_remaining INTEGER DEFAULT 3,
  status TEXT DEFAULT 'active'
);

-- Add RLS policies
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment history"
ON payment_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add INSERT policy for payment_history
CREATE POLICY "Users can insert their own payment history"
ON payment_history FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add UPDATE policy for payment_history
CREATE POLICY "System can update payment history"
ON payment_history FOR UPDATE
TO authenticated
USING (user_id = auth.uid()); 
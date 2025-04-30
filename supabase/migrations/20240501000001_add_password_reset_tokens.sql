-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens(token);

-- Add RLS policies
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role can manage password reset tokens" 
  ON password_reset_tokens 
  USING (auth.jwt() ->> 'role' = 'service_role');
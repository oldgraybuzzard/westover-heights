-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_post_count;
DROP FUNCTION IF EXISTS increment_post_count(UUID);

-- Create function to increment post count
CREATE OR REPLACE FUNCTION increment_post_count(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET post_count = COALESCE(post_count, 0) + 1
  WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_count(UUID) TO authenticated; 
-- Create a function to increment post count
CREATE OR REPLACE FUNCTION increment_post_count(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Use explicit table name and column reference to avoid ambiguity
  UPDATE profiles
  SET 
    post_count = COALESCE(post_count, 0) + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_count(UUID) TO authenticated;

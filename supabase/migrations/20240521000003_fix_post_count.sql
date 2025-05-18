-- Drop the existing function first
DROP FUNCTION IF EXISTS increment_post_count(UUID);

-- Create a function to increment post count
CREATE OR REPLACE FUNCTION increment_post_count(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    post_count = COALESCE(post_count, 0) + 1,
    updated_at = NOW()
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_count(UUID) TO authenticated;

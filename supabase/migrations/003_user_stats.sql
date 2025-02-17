-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, anon, authenticated, service_role;

-- Drop existing function first
DROP FUNCTION IF EXISTS get_users_with_stats();

-- Function to get users with post counts
CREATE OR REPLACE FUNCTION get_users_with_stats()
RETURNS TABLE (
  id uuid,
  email varchar,
  display_name text,
  roles user_role[],
  post_count bigint,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    auth.users.email::varchar,
    p.display_name,
    p.roles,
    COALESCE(
      (SELECT COUNT(*) 
       FROM (
         SELECT author_id FROM topics WHERE author_id = p.id
         UNION ALL
         SELECT author_id FROM replies WHERE author_id = p.id
       ) posts
      ), 0
    ) as post_count,
    p.created_at
  FROM profiles p
  JOIN auth.users ON auth.users.id = p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_users_with_stats() TO authenticated;

-- Add post count to user profile view
CREATE OR REPLACE VIEW user_profile_with_stats AS
SELECT 
  p.*,
  COALESCE(
    (SELECT COUNT(*) 
     FROM (
       SELECT author_id FROM topics WHERE author_id = p.id
       UNION ALL
       SELECT author_id FROM replies WHERE author_id = p.id
     ) posts
    ), 0
  ) as post_count
FROM profiles p; 
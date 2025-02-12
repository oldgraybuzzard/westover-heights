-- Function to get users with post counts
CREATE OR REPLACE FUNCTION get_users_with_stats()
RETURNS TABLE (
  id uuid,
  email text,
  display_name text,
  role user_role,
  post_count bigint,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    auth.users.email,
    p.display_name,
    p.role,
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
$$ LANGUAGE plpgsql;

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
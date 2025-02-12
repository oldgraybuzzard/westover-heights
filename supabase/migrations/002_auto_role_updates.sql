-- Create an enum for user roles if not exists
CREATE TYPE user_role AS ENUM ('SPECTATOR', 'PARTICIPANT', 'EXPERT', 'ADMIN');

-- Add role column to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'PARTICIPANT';

-- Function to update user role based on post count
CREATE OR REPLACE FUNCTION update_user_role_on_post() 
RETURNS TRIGGER AS $$
BEGIN
  -- Count total posts (topics + replies)
  WITH post_count AS (
    SELECT author_id, COUNT(*) as total_posts
    FROM (
      SELECT author_id FROM topics WHERE author_id = NEW.author_id
      UNION ALL
      SELECT author_id FROM replies WHERE author_id = NEW.author_id
    ) posts
    GROUP BY author_id
  )
  -- Update user role if they exceed 3 posts
  UPDATE profiles
  SET role = CASE 
    WHEN pc.total_posts > 3 THEN 'SPECTATOR'::user_role
    ELSE role
  END
  FROM post_count pc
  WHERE profiles.id = pc.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both topics and replies
DROP TRIGGER IF EXISTS update_role_on_topic ON topics;
CREATE TRIGGER update_role_on_topic
  AFTER INSERT ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_role_on_post();

DROP TRIGGER IF EXISTS update_role_on_reply ON replies;
CREATE TRIGGER update_role_on_reply
  AFTER INSERT ON replies
  FOR EACH ROW
  EXECUTE FUNCTION update_user_role_on_post(); 
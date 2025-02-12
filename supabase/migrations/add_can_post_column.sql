-- Add post_count to track number of posts
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- Update existing can_post column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS can_post BOOLEAN DEFAULT false;

-- Update existing profiles to have can_post set to false
UPDATE profiles 
SET can_post = false 
WHERE can_post IS NULL;

-- Function to increment post count
CREATE OR REPLACE FUNCTION increment_post_count()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET post_count = COALESCE(post_count, 0) + 1
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Add post_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'post_count') THEN
    ALTER TABLE profiles ADD COLUMN post_count INTEGER DEFAULT 0;
  END IF;
END $$; 
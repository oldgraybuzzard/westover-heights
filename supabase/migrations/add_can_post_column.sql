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
DECLARE
  current_count INTEGER;
  latest_payment_id UUID;
BEGIN
  -- Get current count first
  SELECT post_count INTO current_count
  FROM profiles
  WHERE id = auth.uid();
  
  -- Get latest active payment
  SELECT id INTO latest_payment_id
  FROM payment_history
  WHERE user_id = auth.uid()
    AND posts_remaining > 0
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Only increment if under limit
  IF current_count < 3 THEN
    -- Update post count and can_post in profiles
    UPDATE profiles
    SET 
      post_count = current_count + 1,
      can_post = CASE 
        WHEN current_count + 1 >= 3 THEN false
        ELSE true
      END
    WHERE id = auth.uid();

    -- Update payment history if exists
    IF latest_payment_id IS NOT NULL THEN
      UPDATE payment_history
      SET 
        posts_remaining = posts_remaining - 1,
        status = CASE 
          WHEN posts_remaining - 1 <= 0 THEN 'used'
          ELSE 'active'
        END
      WHERE id = latest_payment_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
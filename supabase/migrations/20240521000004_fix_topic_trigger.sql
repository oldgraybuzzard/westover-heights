-- Fix the topic_created_trigger function to avoid ambiguous column references
CREATE OR REPLACE FUNCTION topic_created_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Use explicit parameter name to avoid ambiguity
    PERFORM decrement_posts_remaining(NEW.author_id);
    
    -- Update post_count in profiles
    UPDATE profiles
    SET post_count = COALESCE(post_count, 0) + 1
    WHERE id = NEW.author_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;
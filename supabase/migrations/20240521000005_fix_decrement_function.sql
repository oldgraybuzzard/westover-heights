-- Drop the existing function first
DROP FUNCTION IF EXISTS decrement_posts_remaining(UUID);

-- Fix the decrement_posts_remaining function to avoid ambiguous column references
CREATE OR REPLACE FUNCTION decrement_posts_remaining(author_id UUID)
RETURNS void AS $$
DECLARE
    payment_record RECORD;
BEGIN
    -- Get the most recent active payment
    SELECT * INTO payment_record
    FROM payment_history
    WHERE payment_history.user_id = author_id
    AND status = 'active'
    AND posts_remaining > 0
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        -- Update the payment record
        UPDATE payment_history
        SET 
            posts_remaining = payment_record.posts_remaining - 1,
            status = CASE 
                WHEN payment_record.posts_remaining <= 1 THEN 'inactive'
                ELSE 'active'
            END
        WHERE id = payment_record.id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Create a function to decrement posts remaining
CREATE OR REPLACE FUNCTION decrement_posts_remaining(user_id UUID)
RETURNS void AS $$
DECLARE
    payment_record RECORD;
BEGIN
    -- Get the most recent active payment
    SELECT * INTO payment_record
    FROM payment_history
    WHERE user_id = $1
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically decrement posts when a topic is created
CREATE OR REPLACE FUNCTION topic_created_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM decrement_posts_remaining(NEW.author_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_topic_created
    AFTER INSERT ON topics
    FOR EACH ROW
    EXECUTE FUNCTION topic_created_trigger(); 
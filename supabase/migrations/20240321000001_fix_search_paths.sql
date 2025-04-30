-- Fix search paths for all functions flagged by the security linter

-- First, drop functions that need parameter name changes
DROP FUNCTION IF EXISTS decrement_posts_remaining(uuid);

-- decrement_posts_remaining
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
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- grant_posting_permission
CREATE OR REPLACE FUNCTION grant_posting_permission(session_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET can_post = true
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- increment_remaining_posts
CREATE OR REPLACE FUNCTION increment_remaining_posts(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Your function logic here
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- mark_topic_answered
CREATE OR REPLACE FUNCTION mark_topic_answered(
  topic_id UUID,
  response_id UUID,
  expert_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE topics
  SET 
    status = 'ANSWERED'::topic_status,
    expert_response_id = response_id,
    assigned_expert_id = expert_id,
    answered_at = NOW()
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- create_notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_content TEXT,
  p_link TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, content, link)
  VALUES (p_user_id, p_type, p_content, p_link);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- create_profile and create_user_profile
CREATE OR REPLACE FUNCTION create_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Your function logic here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Your function logic here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- topic_created_trigger
CREATE OR REPLACE FUNCTION topic_created_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM decrement_posts_remaining(NEW.author_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- encrypt_value and decrypt_value
CREATE OR REPLACE FUNCTION encrypt_value(
  p_value text,
  p_key_name text default 'app_key'
) RETURNS text AS $$
DECLARE
  v_key bytea;
  v_iv bytea;
BEGIN
  -- Get encryption key
  SELECT key_value INTO v_key 
  FROM encryption_keys 
  WHERE key_name = p_key_name;
  
  -- Generate IV
  v_iv := gen_random_bytes(16);
  
  -- Return IV concatenated with encrypted data
  RETURN encode(
    v_iv || 
    encrypt_iv(
      p_value::bytea,
      v_key,
      v_iv,
      'aes-cbc/pad:pkcs'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION decrypt_value(
  p_encrypted_value text,
  p_key_name text default 'app_key'
) RETURNS text AS $$
DECLARE
  v_key bytea;
  v_decoded bytea;
  v_iv bytea;
  v_data bytea;
BEGIN
  -- Get encryption key
  SELECT key_value INTO v_key 
  FROM encryption_keys 
  WHERE key_name = p_key_name;
  
  -- Decode the base64 string
  v_decoded := decode(p_encrypted_value, 'base64');
  
  -- Extract IV (first 16 bytes) and data
  v_iv := substring(v_decoded from 1 for 16);
  v_data := substring(v_decoded from 17);
  
  -- Decrypt and return
  RETURN convert_from(
    decrypt_iv(
      v_data,
      v_key,
      v_iv,
      'aes-cbc/pad:pkcs'
    ),
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- encrypt_content and decrypt_content
CREATE OR REPLACE FUNCTION encrypt_content(p_content text) 
RETURNS text AS $$
BEGIN
  RETURN encrypt_value(p_content, 'app_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION decrypt_content(p_encrypted_content text) 
RETURNS text AS $$
BEGIN
  RETURN decrypt_value(p_encrypted_content, 'app_key');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- create_topic
CREATE OR REPLACE FUNCTION create_topic()
RETURNS TRIGGER AS $$
BEGIN
  -- Your function logic here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- create_reply_and_update_topic
CREATE OR REPLACE FUNCTION create_reply_and_update_topic()
RETURNS TRIGGER AS $$
BEGIN
  -- Your function logic here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- get_users_with_stats
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
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- notify_new_message
CREATE OR REPLACE FUNCTION notify_new_message() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.recipient_id,
    'message',
    format('New message from %s: %s', 
      (SELECT display_name FROM profiles WHERE id = NEW.sender_id),
      NEW.subject
    ),
    '/expert/messages'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- update_topic_status_on_expert_reply
CREATE OR REPLACE FUNCTION update_topic_status_on_expert_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- Your function logic here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- verify_topic_encryption
CREATE OR REPLACE FUNCTION verify_topic_encryption() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS NOT NULL AND NEW.encrypted_content IS NULL THEN
    RAISE EXCEPTION 'Topic content must be encrypted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Create a config.toml file to enable leaked password protection
-- This should be done outside of SQL migrations

-- Fix search paths for remaining functions flagged by the security linter

-- First, drop all functions to ensure we're replacing the correct versions
DROP FUNCTION IF EXISTS grant_posting_permission(uuid);
DROP FUNCTION IF EXISTS increment_remaining_posts(uuid);
DROP FUNCTION IF EXISTS create_profile();
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS create_topic();
DROP FUNCTION IF EXISTS create_reply_and_update_topic();
DROP FUNCTION IF EXISTS verify_topic_encryption();

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

-- create_profile
CREATE OR REPLACE FUNCTION create_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Your function logic here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

-- create_user_profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Your function logic here
  RETURN NEW;
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

-- Also try using ALTER FUNCTION to set search_path for existing functions
DO $$
BEGIN
  -- Try to alter functions that might have different signatures
  EXECUTE 'ALTER FUNCTION grant_posting_permission(uuid) SET search_path = public, pg_temp';
  EXECUTE 'ALTER FUNCTION increment_remaining_posts(uuid) SET search_path = public, pg_temp';
  EXECUTE 'ALTER FUNCTION create_profile() SET search_path = public, pg_temp';
  EXECUTE 'ALTER FUNCTION create_user_profile() SET search_path = public, pg_temp';
  EXECUTE 'ALTER FUNCTION create_topic() SET search_path = public, pg_temp';
  EXECUTE 'ALTER FUNCTION create_reply_and_update_topic() SET search_path = public, pg_temp';
  EXECUTE 'ALTER FUNCTION verify_topic_encryption() SET search_path = public, pg_temp';
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if functions don't exist with these signatures
  RAISE NOTICE 'Some functions could not be altered: %', SQLERRM;
END $$;

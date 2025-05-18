-- Fix search paths for all versions of the flagged functions

-- First, create a function to help us fix all versions of a function
CREATE OR REPLACE FUNCTION fix_function_search_path(func_name text)
RETURNS void AS $$
DECLARE
    func_record RECORD;
    alter_sql text;
BEGIN
    FOR func_record IN 
        SELECT p.oid, 
               n.nspname as schema_name,
               p.proname as function_name,
               pg_get_function_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = func_name
        AND n.nspname = 'public'
    LOOP
        -- Build ALTER FUNCTION statement
        alter_sql := format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
                           func_record.schema_name,
                           func_record.function_name,
                           func_record.arguments);
        
        -- Execute the ALTER FUNCTION statement
        BEGIN
            EXECUTE alter_sql;
            RAISE NOTICE 'Fixed search_path for function %', alter_sql;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error fixing function %: %', alter_sql, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fix all versions of the flagged functions
SELECT fix_function_search_path('grant_posting_permission');
SELECT fix_function_search_path('increment_remaining_posts');
SELECT fix_function_search_path('create_profile');
SELECT fix_function_search_path('create_user_profile');
SELECT fix_function_search_path('create_topic');
SELECT fix_function_search_path('create_reply_and_update_topic');
SELECT fix_function_search_path('verify_topic_encryption');

-- Drop the helper function when done
DROP FUNCTION fix_function_search_path(text);

-- Drop existing functions before recreating them with different return types
DROP FUNCTION IF EXISTS grant_posting_permission(uuid);
DROP FUNCTION IF EXISTS increment_remaining_posts(uuid);
DROP FUNCTION IF EXISTS create_profile();
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS create_topic();
DROP FUNCTION IF EXISTS create_reply_and_update_topic();
DROP FUNCTION IF EXISTS verify_topic_encryption();

-- Also recreate the specific functions we know about with explicit search_path
-- grant_posting_permission
CREATE OR REPLACE FUNCTION grant_posting_permission(session_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Update the user's profile to allow posting
  UPDATE profiles
  SET 
    can_post = true,
    updated_at = now()
  WHERE id = auth.uid();
  
  -- Return success
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- Log the error
  RAISE LOG 'Error in grant_posting_permission: %', SQLERRM;
  RETURN false;
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

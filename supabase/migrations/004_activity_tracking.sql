-- Create activity types enum
CREATE TYPE activity_type AS ENUM (
  'LOGIN',
  'TOPIC_CREATE',
  'TOPIC_UPDATE',
  'REPLY_CREATE',
  'ROLE_CHANGE'
);

-- Create activity log table
CREATE TABLE activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_activity_type activity_type,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (user_id, activity_type, metadata)
  VALUES (p_user_id, p_activity_type, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Trigger for topic creation
CREATE OR REPLACE FUNCTION log_topic_activity()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_activity(
    NEW.author_id,
    'TOPIC_CREATE',
    jsonb_build_object('topic_id', NEW.id, 'title', NEW.title)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_topic_creation
  AFTER INSERT ON topics
  FOR EACH ROW
  EXECUTE FUNCTION log_topic_activity();

-- Trigger for role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM log_activity(
      NEW.id,
      'ROLE_CHANGE',
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_role_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- Trigger for reply creation
CREATE OR REPLACE FUNCTION log_reply_activity()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_activity(
    NEW.author_id,
    'REPLY_CREATE',
    jsonb_build_object('topic_id', NEW.topic_id, 'reply_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_reply_creation
  AFTER INSERT ON replies
  FOR EACH ROW
  EXECUTE FUNCTION log_reply_activity();

-- Add login tracking
CREATE OR REPLACE FUNCTION log_login_activity()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_activity(
    NEW.id,
    'LOGIN',
    jsonb_build_object('ip', current_setting('request.headers', true)::json->>'x-real-ip')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_login_activity(); 
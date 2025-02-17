-- Create topic_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'topic_status') THEN
    CREATE TYPE topic_status AS ENUM ('open', 'in_progress', 'answered', 'closed');
  END IF;
END $$;

-- Add IN_PROGRESS to topic_status enum if it doesn't exist
DO $$
BEGIN
  ALTER TYPE topic_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS' BEFORE 'ANSWERED';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add message system (if not exists)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check for existing enum type and its values
DO $$ 
DECLARE
  enum_exists boolean;
  enum_values text[];
BEGIN
  -- Check if enum exists
  SELECT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'topic_status'
  ) INTO enum_exists;

  -- If it exists, get its values
  IF enum_exists THEN
    SELECT array_agg(e.enumlabel) INTO enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'topic_status';
    
    RAISE NOTICE 'Existing topic_status enum values: %', enum_values;
  ELSE
    RAISE NOTICE 'topic_status enum does not exist';
  END IF;
END $$;

-- Add expert response tracking columns (if they don't exist)
DO $$ 
BEGIN
  -- Add expert_response_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'topics' AND column_name = 'expert_response_id') THEN
    ALTER TABLE topics ADD COLUMN expert_response_id UUID REFERENCES replies(id);
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'topics' AND column_name = 'status') THEN
    ALTER TABLE topics ADD COLUMN status topic_status DEFAULT 'OPEN';
  END IF;

  -- Add assigned_expert_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'topics' AND column_name = 'assigned_expert_id') THEN
    ALTER TABLE topics ADD COLUMN assigned_expert_id UUID REFERENCES profiles(id);
  END IF;

  -- Add answered_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'topics' AND column_name = 'answered_at') THEN
    ALTER TABLE topics ADD COLUMN answered_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add or replace function to mark topic as answered
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add or replace view for expert dashboard
CREATE OR REPLACE VIEW expert_dashboard AS
SELECT 
  t.id as topic_id,
  t.title,
  t.content,
  t.created_at,
  t.status,
  t.assigned_expert_id,
  t.answered_at,
  p.display_name as author_name,
  p.id as author_id,
  COALESCE(
    (SELECT COUNT(*) FROM replies r WHERE r.topic_id = t.id), 
    0
  ) as reply_count
FROM topics t
JOIN profiles p ON t.author_id = p.id
WHERE t.status != 'CLOSED'::topic_status
ORDER BY 
  CASE t.status
    WHEN 'OPEN'::topic_status THEN 1
    WHEN 'IN_PROGRESS'::topic_status THEN 2
    WHEN 'ANSWERED'::topic_status THEN 3
    ELSE 4
  END,
  t.created_at DESC;

-- Add RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
  DROP POLICY IF EXISTS "Users can send messages" ON messages;
  
  -- Create new policies
  CREATE POLICY "Users can read their own messages"
    ON messages FOR SELECT
    USING (auth.uid() IN (sender_id, recipient_id));

  CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
END $$;

-- Grant permissions
GRANT SELECT ON expert_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION mark_topic_answered TO authenticated; 
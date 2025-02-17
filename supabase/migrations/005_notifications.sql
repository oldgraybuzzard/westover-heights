-- Add notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'reply', 'mention')),
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Add function to create notification
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for new messages
CREATE OR REPLACE FUNCTION notify_new_message() RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message(); 
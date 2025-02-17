export interface ExpertTopic {
  topic_id: string;
  title: string;
  content: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'answered' | 'closed';
  assigned_expert_id: string | null;
  answered_at: string | null;
  author_name: string;
  author_id: string;
  reply_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
} 
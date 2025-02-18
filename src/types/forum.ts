import { UserRole } from './user';

export type TopicStatus = 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';

export interface Topic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status: TopicStatus;
  category: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    display_name: string;
    roles: UserRole[];
    role?: UserRole;
    email_visible: boolean;
    created_at: string;
    updated_at: string;
  };
  profiles?: any; // Add this temporarily to handle the raw data
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

export interface ExpertDashboardTopic {
  topic_id: string;
  title: string;
  content: string;
  created_at: string;
  status: TopicStatus;
  assigned_expert_id: string | null;
  answered_at: string | null;
  author_name: string;
  author_id: string;
  reply_count: number;
}

interface ExpertTopic {
  topic_id: string;
  title: string;
  content: string;
  created_at: string;
  answered_at: string | null;
  author_name: string;
  author_id: string;
  reply_count: number;
  status: 'new' | 'in_progress' | 'answered';
  assigned_expert_id: string | null | undefined;
} 
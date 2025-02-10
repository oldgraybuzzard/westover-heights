export type Profile = {
  id: string;
  display_name: string;
  role: 'USER' | 'EXPERT' | 'ADMIN';
  email_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  category: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type Reply = {
  id: string;
  content: string;
  author_id: string;
  topic_id: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}; 
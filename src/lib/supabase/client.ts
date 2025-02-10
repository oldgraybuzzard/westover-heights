import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});

// Types for our database schema
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
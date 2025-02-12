import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Add a simple delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create a rate-limited client
export const supabase = createClientComponentClient<Database>({
  cookieOptions: {
    name: 'sb-auth-token',
    domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
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

// Add realtime subscription for role changes
export function subscribeToRoleChanges(userId: string, onRoleChange: (newRole: string) => void) {
  return supabase
    .channel('role-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new.role !== payload.old.role) {
          onRoleChange(payload.new.role);
        }
      }
    )
    .subscribe();
}

export async function handleSupabaseError(error: any) {
  if (error?.message?.includes('Invalid Refresh Token') || error?.status === 400) {
    // Clear the invalid session
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
    return;
  }
  
  if (error?.status === 429) {
    console.warn('Rate limit reached. Please try again in a few minutes.');
    // Don't throw, just return to prevent retry loops
    return;
  }
  
  throw error;
}

// Add a function to check reply limits
export async function canAddReply(topicId: string, userId: string) {
  const { data: replies, error } = await supabase
    .from('replies')
    .select('id')
    .eq('topic_id', topicId)
    .eq('author_id', userId);

  if (error) {
    await handleSupabaseError(error);
    return false;
  }

  // Limit to 2 follow-up replies per user per topic
  return replies?.length < 2;
}

// Optional: Add a function to get current reply count
export async function getUserReplyCount(topicId: string, userId: string) {
  const { data: replies, error } = await supabase
    .from('replies')
    .select('id')
    .eq('topic_id', topicId)
    .eq('author_id', userId);

  if (error) {
    await handleSupabaseError(error);
    return 0;
  }

  return replies?.length || 0;
}

export async function updateCanPost(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      can_post: true,
      post_count: 0  // Reset post count after payment
    })
    .eq('id', userId);
    
  if (error) throw error;
}
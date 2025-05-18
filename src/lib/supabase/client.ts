import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { UserRole } from '@/types/database';

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
  role: UserRole;
  roles: UserRole[];
  email_visible: boolean;
  created_at: string;
  updated_at: string;
  encrypted_email?: string;
  email?: string;
  can_post: boolean;
  post_count: number;
};

export type Topic = {
  id: string;
  title: string;
  content: string;
  encrypted_content?: string;
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

// Update existing types and add new ones for encrypted data

export type EncryptedProfile = {
  id: string;
  display_name: string;
  role: 'USER' | 'EXPERT' | 'ADMIN';
  email_visible: boolean;
  created_at: string;
  updated_at: string;
  encrypted_email?: string;
};

export type EncryptedReply = {
  id: string;
  content: string;
  encrypted_content: string;
  decrypted_content?: string;
  author_id: string;
  topic_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    display_name: string;
    roles: string[];
    created_at: string;
    updated_at: string;
    email_visible: boolean;
  };
};

export type EncryptedTopic = {
  id: string;
  title: string;
  content: string;
  encrypted_content: string;
  decrypted_content?: string;
  author_id: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  category: string;
  created_at: string;
  updated_at: string;
  author?: EncryptedProfile;
  replies?: EncryptedReply[];
  expert_response_id?: string;
  assigned_expert_id?: string;
  answered_at?: string;
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

export async function updateCanPost(userId: string, paymentIntentId?: string) {
  console.log('Updating can_post for user:', userId, 'with payment:', paymentIntentId);
  
  try {
    // First create payment history record
    console.log('Creating payment history record...');
    const { error: historyError } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        payment_intent_id: paymentIntentId || 'manual',
        amount: 2500,
        posts_remaining: 3,
        status: 'active'
      });

    if (historyError) {
      console.error('Payment history error:', historyError);
      // Continue even if payment history fails - we'll manually fix later if needed
    }

    // Then directly update the profile instead of using RPC
    console.log('Directly updating profile can_post status...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        can_post: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }
    
    console.log('Successfully updated can_post for user:', userId);
    return true;
  } catch (error) {
    console.error('Error in updateCanPost:', error);
    // Return false instead of throwing to prevent unhandled promise rejection
    return false;
  }
}

export async function encryptEmail(email: string) {
  const { data, error } = await supabase
    .rpc('encrypt_email', { p_email: email })
    .single();

  if (error) throw error;
  return data;
}

export async function encryptContent(content: string) {
  const { data, error } = await supabase
    .rpc('encrypt_content', { p_content: content })
    .single();

  if (error) throw error;
  return data;
}

// Update the fetch functions to use decrypted views
export async function fetchTopic(topicId: string) {
  const { data, error } = await supabase
    .from('decrypted_topics')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('id', topicId)
    .single();

  if (error) throw error;
  return data as EncryptedTopic;
}

export async function fetchTopics() {
  const { data, error } = await supabase
    .from('decrypted_topics')
    .select(`
      *,
      author:profiles(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EncryptedTopic[];
}

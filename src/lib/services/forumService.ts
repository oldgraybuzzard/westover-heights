import { supabase } from '@/lib/supabase/client';
import { Topic, Reply, Profile } from '@/types/supabase';

export class ForumService {
  static async getTopics(
    page: number = 1,
    category?: string,
    status?: 'OPEN' | 'ANSWERED' | 'CLOSED' | 'all'
  ) {
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from('topics')
      .select(`
        *,
        author:profiles(display_name, role)
      `)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      topics: data,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  static async getTopic(id: string) {
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select(`
        *,
        author:profiles(display_name, role)
      `)
      .eq('id', id)
      .single();

    if (topicError) throw topicError;

    const { data: replies, error: repliesError } = await supabase
      .from('replies')
      .select(`
        *,
        author:profiles(display_name, role)
      `)
      .eq('topic_id', id)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return { topic, replies };
  }

  static async createTopic(data: {
    title: string;
    content: string;
    category: string;
    author_id: string;
  }) {
    const { data: topic, error } = await supabase
      .from('topics')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return topic;
  }

  static async createReply(data: {
    content: string;
    topic_id: string;
    author_id: string;
  }) {
    const { data: reply, error } = await supabase
      .from('replies')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return reply;
  }

  static async updateTopicStatus(id: string, status: 'OPEN' | 'ANSWERED' | 'CLOSED') {
    const { data, error } = await supabase
      .from('topics')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 
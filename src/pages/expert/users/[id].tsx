'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';

interface UserHistory {
  profile: {
    id: string;
    display_name: string;
    roles: string[];
    created_at: string;
  };
  topics: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    reply_count: number;
  }[];
  replies: {
    id: string;
    content: string;
    created_at: string;
    topic: {
      id: string;
      title: string;
    };
  }[];
}

export default function UserHistoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isExpert } = useAuth();
  const [history, setHistory] = useState<UserHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState({ subject: '', content: '' });

  useEffect(() => {
    if (!isExpert()) {
      router.push('/unauthorized');
      return;
    }
    if (id) {
      fetchUserHistory();
    }
  }, [id, isExpert, router]);

  const fetchUserHistory = async () => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Fetch user's topics with reply count
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          status,
          created_at,
          reply_count:replies(count)
        `)
        .eq('author_id', id)
        .order('created_at', { ascending: false });

      if (topicsError) throw topicsError;

      // Fetch user's replies with topic info
      const { data: replies, error: repliesError } = await supabase
        .from('replies')
        .select(`
          id,
          content,
          created_at,
          topic:topics (
            id,
            title
          )
        `)
        .eq('author_id', id)
        .order('created_at', { ascending: false });

      if (repliesError) throw repliesError;

      setHistory({
        profile,
        topics: (topics || []).map(topic => ({
          ...topic,
          reply_count: topic.reply_count[0]?.count || 0
        })),
        replies: (replies || []).map(reply => ({
          ...reply,
          topic: reply.topic[0] || { id: '', title: '' }
        }))
      });
    } catch (error) {
      console.error('Error fetching user history:', error);
      toast.error('Failed to fetch user history');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.subject.trim() || !message.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          recipient_id: id,
          subject: message.subject,
          content: message.content
        });

      if (error) throw error;

      toast.success('Message sent successfully');
      setShowMessageModal(false);
      setMessage({ subject: '', content: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!history) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/expert/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-primary"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {history.profile.display_name}
            </h1>
            <p className="text-gray-500 mt-1">
              Member since {format(new Date(history.profile.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={() => setShowMessageModal(true)}
            className="inline-flex items-center text-primary hover:text-primary/80"
          >
            <FaEnvelope className="mr-2" /> Send Message
          </button>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-100 rounded-lg px-4 py-2">
            <div className="text-sm text-gray-500">Topics</div>
            <div className="text-xl font-semibold">{history.topics.length}</div>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2">
            <div className="text-sm text-gray-500">Replies</div>
            <div className="text-xl font-semibold">{history.replies.length}</div>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Topics</h2>
        <div className="space-y-4">
          {history.topics.map(topic => (
            <Link
              key={topic.id}
              href={`/forum/${topic.id}`}
              className="block hover:bg-gray-50 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{topic.title}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(topic.created_at), 'MMM d, yyyy')} • {topic.reply_count} replies
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${topic.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                  topic.status === 'ANSWERED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {topic.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Replies */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Replies</h2>
        <div className="space-y-4">
          {history.replies.map(reply => (
            <Link
              key={reply.id}
              href={`/forum/${reply.topic.id}`}
              className="block hover:bg-gray-50 p-4 rounded-lg"
            >
              <h3 className="font-medium text-gray-900">{reply.topic.title}</h3>
              <p className="text-gray-600 mt-1">{reply.content.substring(0, 150)}...</p>
              <p className="text-sm text-gray-500 mt-2">
                {format(new Date(reply.created_at), 'MMM d, yyyy')}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={message.subject}
                  onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={message.content}
                  onChange={(e) => setMessage({ ...message, content: e.target.value })}
                  className="w-full h-32 p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
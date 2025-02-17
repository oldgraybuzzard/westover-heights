'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ExpertTopic } from '@/types/expert';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { UserRole } from '@/types/user';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    display_name: string;
    roles: string[];
    role: UserRole;
    email_visible: boolean;
    created_at: string;
    updated_at: string;
  };
}

export default function QuestionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isExpert } = useAuth();
  const [topic, setTopic] = useState<ExpertTopic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState({ subject: '', content: '' });

  useEffect(() => {
    if (!isExpert()) {
      router.push('/unauthorized');
      return;
    }
    if (id) {
      fetchTopicDetails();
    }
  }, [id, isExpert, router]);

  const fetchTopicDetails = async () => {
    try {
      // Fetch topic details
      const { data: topicData, error: topicError } = await supabase
        .from('expert_dashboard')
        .select('*')
        .eq('topic_id', id)
        .single();

      if (topicError) throw topicError;
      setTopic(topicData);

      // Fetch replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('replies')
        .select(`
          id,
          content,
          created_at,
          author:profiles (
            id,
            display_name,
            roles,
            email_visible,
            created_at,
            updated_at
          )
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      const formattedReplies = repliesData?.map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        created_at: reply.created_at,
        author: {
          id: reply.author.id,
          display_name: reply.author.display_name,
          roles: reply.author.roles,
          role: reply.author.roles[0] as UserRole,
          email_visible: reply.author.email_visible,
          created_at: reply.author.created_at,
          updated_at: reply.author.updated_at
        }
      })) || [];

      setReplies(formattedReplies);
    } catch (error) {
      console.error('Error fetching topic details:', error);
      toast.error('Failed to fetch topic details');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!response.trim()) {
      toast.error('Response cannot be empty');
      return;
    }

    try {
      // Add reply
      const { data: replyData, error: replyError } = await supabase
        .from('replies')
        .insert({
          topic_id: id,
          content: response,
          author_id: user?.id
        })
        .select()
        .single();

      if (replyError) throw replyError;

      // Mark topic as answered
      const { error: topicError } = await supabase
        .rpc('mark_topic_answered', {
          topic_id: id,
          response_id: replyData.id,
          expert_id: user?.id
        });

      if (topicError) throw topicError;

      toast.success('Response submitted successfully');
      setResponse('');
      fetchTopicDetails(); // Refresh the data
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    }
  };

  const sendMessage = async () => {
    if (!topic?.author_id || !message.subject.trim() || !message.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: topic.author_id,
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

  if (!topic) {
    return <div>Topic not found</div>;
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

      {/* Question Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
          <button
            onClick={() => setShowMessageModal(true)}
            className="inline-flex items-center text-primary hover:text-primary/80"
          >
            <FaEnvelope className="mr-2" /> Message Author
          </button>
        </div>
        <p className="text-gray-700 mb-4">{topic.content}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>By {topic.author_name}</span>
            <span>{format(new Date(topic.created_at), 'MMM d, yyyy h:mm a')}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${topic.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            topic.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
            {topic.status.replace('_', ' ').charAt(0).toUpperCase() + topic.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-6 mb-8">
        {replies.map(reply => (
          <div
            key={reply.id}
            className={`bg-white rounded-lg shadow-md p-6 ${reply.author.roles.includes('EXPERT') ? 'border-l-4 border-primary' : ''
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{reply.author.display_name}</span>
                {reply.author.roles.includes('EXPERT') && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    Expert
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(reply.created_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <p className="text-gray-700">{reply.content}</p>
          </div>
        ))}
      </div>

      {/* Response Form */}
      {topic.status !== 'closed' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Response</h2>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Type your response here..."
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={submitResponse}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Submit Response
            </button>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send Message to Author</h2>
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
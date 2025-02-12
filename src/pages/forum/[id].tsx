import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, Topic, Reply, canAddReply, getUserReplyCount } from '@/lib/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaArrowLeft, FaReply } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from '@/components/SignInModal';
import UserBadge from '@/components/UserBadge';

export default function TopicDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [canReply, setCanReply] = useState(true);

  useEffect(() => {
    async function loadTopic() {
      if (!id) return;

      try {
        const [topicResult, repliesResult] = await Promise.all([
          supabase
            .from('topics')
            .select(`*, author:profiles(*)`)
            .eq('id', id)
            .single(),
          supabase
            .from('replies')
            .select(`*, author:profiles(*)`)
            .eq('topic_id', id)
            .order('created_at', { ascending: true })
        ]);

        if (topicResult.error) throw topicResult.error;
        if (repliesResult.error) throw repliesResult.error;

        setTopic(topicResult.data);
        setReplies(repliesResult.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [id]);

  useEffect(() => {
    async function checkReplyLimit() {
      if (!user || !id) return;

      const count = await getUserReplyCount(id as string, user.id);
      const canAdd = await canAddReply(id as string, user.id);

      setReplyCount(count);
      setCanReply(canAdd);
    }

    checkReplyLimit();
  }, [id, user, replies]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!user) {
        throw new Error('Please sign in to reply');
      }

      const canAdd = await canAddReply(id as string, user.id);
      if (!canAdd) {
        throw new Error('You have reached the maximum number of replies for this topic');
      }

      const { data: reply, error } = await supabase
        .from('replies')
        .insert({
          content: replyContent,
          topic_id: id,
          author_id: user.id
        })
        .select(`*, author:profiles(*)`)
        .single();

      if (error) throw error;

      setReplies([...replies, reply]);
      setReplyContent('');
      setReplyCount(prev => prev + 1);
      setCanReply(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTopicStatus(status: 'OPEN' | 'ANSWERED' | 'CLOSED') {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setTopic(topic => topic ? { ...topic, status } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    }
  }

  const handleReplyAttempt = () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    // Continue with reply form display/focus
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!topic) return <div>Topic not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      <Link
        href="/forum"
        className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Forum
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${topic.status === 'OPEN' ? 'bg-green-100 text-green-800' :
            topic.status === 'ANSWERED' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {topic.status}
          </span>
        </div>

        <div className="text-gray-600 mb-2">
          Posted by {topic.author?.display_name} in {topic.category}
        </div>

        <div className="text-gray-500 text-sm mb-6">
          {format(new Date(topic.created_at), 'MMM d, yyyy')}
        </div>

        <div className="prose max-w-none">
          {topic.content}
        </div>
      </div>

      {(user?.id === topic?.author_id || user?.user_metadata.role === 'EXPERT') && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">Update Status</h3>
          <div className="flex gap-2">
            <button
              onClick={() => updateTopicStatus('OPEN')}
              className={`px-3 py-1 rounded-full text-sm ${topic.status === 'OPEN' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                }`}
            >
              Open
            </button>
            <button
              onClick={() => updateTopicStatus('ANSWERED')}
              className={`px-3 py-1 rounded-full text-sm ${topic.status === 'ANSWERED' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                }`}
            >
              Answered
            </button>
            <button
              onClick={() => updateTopicStatus('CLOSED')}
              className={`px-3 py-1 rounded-full text-sm ${topic.status === 'CLOSED' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
            >
              Closed
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Replies ({replies.length})
        </h2>

        {replies.map((reply) => (
          <div
            key={reply.id}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{reply.author?.display_name}</span>
                <UserBadge role={reply.author?.role || 'PARTICIPANT'} />
              </div>
            </div>

            <div className="text-gray-500 text-sm">
              {format(new Date(reply.created_at), 'MMM d, yyyy')}
            </div>

            <div className="prose max-w-none">
              {reply.content}
            </div>
          </div>
        ))}

        {topic.status !== 'CLOSED' ? (
          user ? (
            canReply ? (
              <form onSubmit={handleReply} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Post a Reply</h3>
                <p className="text-gray-600 mb-4">
                  You have {2 - replyCount} replies remaining for this topic
                </p>

                {error && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                  rows={4}
                  className="form-textarea w-full mb-4"
                  placeholder="Write your reply..."
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FaReply /> {submitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                You have reached the maximum number of replies for this topic
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600 mb-4">Please sign in to reply</p>
              <button
                onClick={() => setShowSignInModal(true)}
                className="btn-primary"
              >
                Sign In
              </button>
            </div>
          )
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
            This topic is closed
          </div>
        )}
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </div>
  );
} 
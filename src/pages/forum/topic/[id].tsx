import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { FaArrowLeft, FaReply, FaTrash } from 'react-icons/fa';
import ResponseTemplateSelector from '@/components/ResponseTemplateSelector';
import { supabase } from '@/lib/supabase/client';
import { Topic as TopicType } from '@/types/forum';
import { toast } from 'react-hot-toast';
import Skeleton from '@/components/Skeleton';
import { useNotification } from '@/contexts/NotificationContext';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    display_name: string;
    roles: UserRole[];
    role?: UserRole;
    email_visible: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface TopicData extends TopicType {
  expert_response_id?: string;
  replies: Reply[];
  author: {
    id: string;
    display_name: string;
    roles: UserRole[];
    role?: UserRole;
    email_visible: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface ReplyValidation {
  content: string[];
}

interface ExtendedUser extends User {
  roles?: string[];
}

const TopicPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, userRoles } = useAuth() as { user: ExtendedUser | null, userRoles: UserRole[] };
  const { showNotification } = useNotification();
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyErrors, setReplyErrors] = useState<ReplyValidation>({ content: [] });
  const [replyCount, setReplyCount] = useState<number>(0);
  const [canReply, setCanReply] = useState(false);

  const fetchTopic = async () => {
    try {
      if (!id) {
        console.log('No id provided');
        return;
      }

      console.log('Starting fetch for topic:', id);
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          author:profiles!topics_author_id_fkey (
            id,
            display_name,
            roles,
            email_visible,
            created_at,
            updated_at
          ),
          replies!replies_topic_id_fkey (
            id,
            content,
            created_at,
            author:profiles!replies_author_id_fkey (
              id,
              display_name,
              roles,
              email_visible,
              created_at,
              updated_at
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log('No data returned');
        throw new Error('Topic not found');
      }

      console.log('Topic data:', data);
      const formattedData: TopicData = {
        ...data,
        author: {
          ...data.author,
          role: data.author.roles[0] as UserRole || 'PARTICIPANT' as UserRole
        },
        replies: data.replies?.map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          created_at: reply.created_at,
          author: {
            ...reply.author,
            roles: reply.author.roles || [],
            role: reply.author.roles?.[0] as UserRole || 'PARTICIPANT' as UserRole,
            email_visible: reply.author.email_visible || false,
            created_at: reply.author.created_at,
            updated_at: reply.author.updated_at
          }
        })) || []
      };

      setTopic(formattedData);
      setLoading(false);
    } catch (e) {
      console.error('Error fetching topic:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Topic page mounted, id:', id);
    console.log('Router query:', router.query);
    console.log('Router pathname:', router.pathname);
    console.log('Router asPath:', router.asPath);

    if (id) {
      console.log('Calling fetchTopic with id:', id);
      fetchTopic();
    }
  }, [id, router]);

  const validateReply = (content: string): boolean => {
    const errors: ReplyValidation = { content: [] };
    let isValid = true;

    if (!content.trim()) {
      errors.content.push('Reply content is required');
      isValid = false;
    } else if (content.trim().length < 10) {
      errors.content.push('Reply must be at least 10 characters long');
      isValid = false;
    } else if (content.trim().length > 10000) {
      errors.content.push('Reply must be less than 10,000 characters');
      isValid = false;
    }

    setReplyErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!user) {
      showNotification('error', 'You must be logged in to reply');
      return;
    }

    if (!validateReply(replyContent)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Start a Supabase transaction
      const { data: reply, error: replyError } = await supabase
        .rpc('create_reply_and_update_topic', {
          p_content: replyContent.trim(),
          p_topic_id: id,
          p_author_id: user.id,
          p_is_expert: userRoles?.includes('EXPERT') || false
        });

      if (replyError) throw replyError;

      showNotification('success', 'Reply posted successfully');
      setReplyContent('');
      setReplyErrors({ content: [] });
      await fetchTopic();
    } catch (e) {
      console.error('Error posting reply:', e);
      showNotification('error', e instanceof Error ? e.message : 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (content: string) => {
    setReplyContent(prevContent => {
      if (prevContent.trim()) {
        return `${prevContent}\n\n${content}`;
      }
      return content;
    });
  };

  const handleDelete = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      // First update the topic to remove the expert_response_id and reset status
      const { error: updateError } = await supabase
        .from('topics')
        .update({
          expert_response_id: null,
          status: 'OPEN'
        })
        .eq('id', id)
        .eq('expert_response_id', replyId);

      if (updateError) throw updateError;

      // Then delete the reply
      const { error: deleteError } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId)
        .eq('topic_id', id);

      if (deleteError) throw deleteError;

      await fetchTopic();
      toast.success('Reply deleted successfully');

    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete reply');
    }
  };

  const canModerate = () => {
    return userRoles?.some(role => ['EXPERT', 'ADMIN'].includes(role)) ?? false;
  };

  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-16">
      {/* Navigation Skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-24 h-6" />
        <div className="text-gray-400">/</div>
        <Skeleton className="w-16 h-6" />
      </div>

      {/* Topic Header Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="w-2/3 h-8" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
      </div>

      {/* Replies Skeleton */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-24 h-5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const isExpertUser = () => {
    return Boolean(userRoles?.includes('EXPERT'));
  };

  const getUserReplyCount = async (userId: string) => {
    const { data, error } = await supabase
      .from('replies')
      .select('id')
      .eq('author_id', userId)
      .eq('topic_id', id);

    if (error) {
      console.error('Error getting reply count:', error);
      return 0;
    }

    // Count original post as first reply if user is author
    const isAuthor = topic?.author_id === userId;
    return (data?.length || 0) + (isAuthor ? 1 : 0);
  };

  const canUserReply = async (user: ExtendedUser | null, topic: TopicData) => {
    if (!user) {
      console.log('No user');
      return false;
    }

    console.log('Checking user permissions:', {
      userId: user.id,
      userRoles,
      isExpert: userRoles?.includes('EXPERT'),
      isAuthor: user.id === topic.author_id
    });

    // First check if user is an expert
    if (userRoles?.includes('EXPERT')) {
      console.log('User is an expert - can reply');
      return true;
    }

    // If not an expert, check if they're the topic author
    const isAuthor = user.id === topic.author_id;
    if (isAuthor) {
      // Get current reply count for this user in this topic
      const count = await getUserReplyCount(user.id);
      setReplyCount(count);
      const canPost = count < 3;
      console.log('Author reply count:', count, 'Can post:', canPost);
      return canPost;
    }

    return false;
  };

  useEffect(() => {
    if (user && topic && !userRoles?.includes('EXPERT')) {
      getUserReplyCount(user.id).then(count => setReplyCount(count));
    }
  }, [user, topic, userRoles]);

  useEffect(() => {
    if (user && topic) {
      canUserReply(user, topic).then(setCanReply);
    }
  }, [user, topic, userRoles]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 pt-16">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error Loading Topic</h2>
          <p>{error}</p>
          <button
            onClick={fetchTopic}
            className="mt-4 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return <div>Topic not found</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/forum" className="text-gray-600 hover:text-primary flex items-center gap-2">
          <FaArrowLeft /> Back to Forum
        </Link>
        <div className="text-gray-400">/</div>
        <span className="text-gray-600">Topic</span>
      </div>

      {/* Topic Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${topic.status === 'ANSWERED' ? 'bg-green-100 text-green-800' :
              topic.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
              {topic.status}
            </span>
            {canModerate() && topic.expert_response_id && (
              <button
                onClick={() => topic.expert_response_id && handleDelete(topic.expert_response_id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete Topic"
              >
                <FaTrash size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="prose max-w-none mb-4">
          {topic.content}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-4">
          <span>Posted by {topic.author?.display_name}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-6">
        {/* Sort all replies by created_at */}
        {[...topic.replies]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((reply) => {
            const isExpertReply = reply.author.roles.includes('EXPERT');
            const isAuthorReply = reply.author.id === topic.author_id;

            return (
              <div
                key={reply.id}
                className={`bg-white rounded-lg shadow-md p-6 ${isExpertReply ? 'border-l-4 border-primary' : ''
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {reply.author.display_name}
                    </span>
                    {isExpertReply && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        Expert
                      </span>
                    )}
                    {isAuthorReply && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        Author
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {format(new Date(reply.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    {canModerate() && (
                      <button
                        onClick={() => handleDelete(reply.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Reply"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="prose max-w-none">
                  {reply.content}
                </div>
              </div>
            );
          })}
      </div>

      {/* Reply Form - Only show if user can reply */}
      {user && (
        (topic.status === 'OPEN' ||
          (topic.status === 'ANSWERED' &&
            ((user.id === topic.author_id && replyCount < 3) || isExpertUser())
          )) && canReply && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Post a Reply</h2>
            {!isExpertUser() && (
              <div className="mb-4 text-sm text-gray-600">
                You have {3 - replyCount} replies remaining for this topic.
              </div>
            )}
            <div className="space-y-4">
              {isExpertUser() ? (
                // Expert Reply Form with Templates
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Expert Response
                    </label>
                    <textarea
                      value={replyContent}
                      onChange={(e) => {
                        setReplyContent(e.target.value);
                        if (replyErrors.content.length) {
                          validateReply(e.target.value);
                        }
                      }}
                      className={`w-full h-48 p-3 border rounded-lg ${replyErrors.content.length ? 'border-red-500' : ''}`}
                      placeholder="Write your expert response..."
                    />
                    {replyErrors.content.map((error, index) => (
                      <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
                    ))}
                    <p className="mt-1 text-sm text-gray-500">
                      {replyContent.length}/10000 characters
                    </p>
                  </div>
                  <div className="w-80">
                    <ResponseTemplateSelector
                      onSelect={handleTemplateSelect}
                      currentContent={replyContent}
                    />
                  </div>
                </div>
              ) : (
                // Simple Reply Form for Participants
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyContent}
                    onChange={(e) => {
                      setReplyContent(e.target.value);
                      if (replyErrors.content.length) {
                        validateReply(e.target.value);
                      }
                    }}
                    className={`w-full h-32 p-3 border rounded-lg ${replyErrors.content.length ? 'border-red-500' : ''}`}
                    placeholder="Write your reply..."
                  />
                  {replyErrors.content.map((error, index) => (
                    <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
                  ))}
                  <p className="mt-1 text-sm text-gray-500">
                    {replyContent.length}/10000 characters
                  </p>
                </div>
              )}
              {/* Only show submit button if user has replies remaining or is an expert */}
              {(isExpertUser() || replyCount < 3) && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* Update the message for ANSWERED status */}
      {user && topic.status === 'ANSWERED' && (
        <div className="mt-8 bg-blue-50 text-blue-800 p-6 rounded-lg">
          <p className="font-medium">This topic has been answered by an expert</p>
          {!isExpertUser() && replyCount < 3 && (
            <p className="text-sm mt-1">
              You can still use your remaining replies to ask follow-up questions.
            </p>
          )}
        </div>
      )}

      {/* Only show CLOSED message when actually closed */}
      {user && topic.status === 'CLOSED' && (
        <div className="mt-8 bg-yellow-50 text-yellow-800 p-6 rounded-lg">
          <p className="font-medium">This topic is closed</p>
          <p className="text-sm mt-1">
            This topic is no longer accepting replies.
          </p>
        </div>
      )}

      {/* Info for Non-logged in Users */}
      {!user && (
        <div className="mt-8 bg-primary/5 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Only the original poster and experts can reply to this topic.
          </p>
        </div>
      )}

      {/* Reply count warning for participants */}
      {user && !isExpertUser() && replyCount > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          You have used {replyCount}/3 replies for this topic.
        </div>
      )}
    </main>
  );
};

export default TopicPage; 
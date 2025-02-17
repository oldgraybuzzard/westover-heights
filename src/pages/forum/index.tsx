import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToRoleChanges } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { UserRole } from '@/types/user';
import { useRouter } from 'next/router';

interface ProfileData {
  id: string;
  display_name: string;
  roles: string[];
  email_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface ReplyWithAuthor {
  id: string;
  created_at: string;
  status: string;
  roles: string[];
}

interface ReplyAuthor {
  id: string;
  roles: string[];
  created_at: string;
  display_name: string;
  updated_at: string;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  status: string;
  category: string;
  created_at: string;
  author_id: string;
  author?: {
    id: string;
    display_name: string;
    roles: string[];
    role?: UserRole;
    email_visible: boolean;
    created_at: string;
    updated_at: string;
  };
  replies?: {
    id: string;
    created_at: string;
    author: ReplyWithAuthor;
  }[];
}

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRoles } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadTopics() {
      try {
        console.log('Loading topics...');

        const { data, error } = await supabase
          .from('topics')
          .select(`
            id,
            title,
            content,
            category,
            status,
            created_at,
            updated_at,
            author_id,
            profiles!topics_author_id_fkey (
              id,
              display_name,
              roles,
              email_visible,
              created_at,
              updated_at
            ),
            replies!replies_topic_id_fkey (
              id,
              created_at,
              author:profiles!replies_author_id_fkey (
                id,
                roles,
                display_name,
                created_at,
                updated_at
              )
            )
          `)
          .order('created_at', { ascending: false });

        console.log('Topics data:', data);

        if (error) {
          throw error;
        }

        const formattedTopics = data?.map((topic: any) => {
          const { profiles, replies, ...rest } = topic;
          return {
            ...rest,
            author: profiles ? {
              ...profiles,
              role: profiles.roles?.[0] as UserRole || 'PARTICIPANT' as UserRole
            } : undefined,
            replies: replies?.map((reply: any) => {
              const authorData = Array.isArray(reply.author) ? reply.author[0] : reply.author;
              return {
                id: reply.id,
                created_at: reply.created_at,
                author: {
                  id: authorData.id,
                  created_at: authorData.created_at,
                  status: 'OPEN',
                  roles: authorData.roles
                } as ReplyWithAuthor
              };
            })
          };
        }) as Topic[];

        if (mounted) {
          setTopics(formattedTopics);
        }
      } catch (e) {
        console.error('Error loading topics:', e);
        if (mounted) {
          setError(e instanceof Error ? e.message : 'An error occurred');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTopics();

    if (!user) return;

    const subscription = subscribeToRoleChanges(user.id, (newRole) => {
      toast.success(`Your role has been updated to ${newRole.toLowerCase()}`);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    // Subscribe to topic status changes
    const subscription = supabase
      .channel('topic_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'topics'
        },
        (payload) => {
          // Refresh topics when any topic is updated
          loadTopics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleTopicClick = (topicId: string) => {
    console.log('Clicking topic:', topicId);
    router.push(`/forum/topic/${topicId}`);
  };

  const isExpertUser = () => {
    return userRoles?.includes('EXPERT') ?? false;
  };

  const loadTopics = async () => {
    try {
      console.log('Loading topics...');

      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          content,
          category,
          status,
          created_at,
          updated_at,
          author_id,
          profiles!topics_author_id_fkey (
            id,
            display_name,
            roles,
            email_visible,
            created_at,
            updated_at
          ),
          replies!replies_topic_id_fkey (
            id,
            created_at,
            author:profiles!replies_author_id_fkey (
              id,
              roles,
              display_name,
              created_at,
              updated_at
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTopics = data?.map((topic) => {
        const { profiles, replies, ...rest } = topic;
        return {
          ...rest,
          author: (profiles as unknown as ProfileData) ? {
            ...(profiles as unknown as ProfileData),
            role: (profiles as unknown as ProfileData).roles?.[0] as UserRole || 'PARTICIPANT' as UserRole
          } : undefined,
          replies: replies?.map((reply) => {
            const authorData = Array.isArray(reply.author) ? reply.author[0] : reply.author;
            return {
              id: reply.id,
              created_at: reply.created_at,
              author: {
                id: authorData.id,
                created_at: authorData.created_at,
                status: 'OPEN',
                roles: authorData.roles
              } as ReplyWithAuthor
            };
          })
        };
      }) as Topic[];

      setTopics(formattedTopics);
    } catch (e) {
      console.error('Error loading topics:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading topics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const getTopicStatus = (topic: Topic) => {
    console.log('Analyzing topic:', topic.title);

    if (!topic.replies?.length) {
      console.log('No replies - needs attention');
      return { needsAttention: true, reason: 'NEW_TOPIC' };
    }

    const sortedReplies = [...topic.replies].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Count messages
    let participantMessages = 1; // Start with 1 for original post
    let expertReplies = 0;
    let lastParticipantTime = new Date(topic.created_at).getTime();
    let lastExpertTime = 0;

    console.log('Initial state:', {
      participantMessages,
      expertReplies,
      lastParticipantTime: new Date(lastParticipantTime).toISOString(),
      lastExpertTime: lastExpertTime ? new Date(lastExpertTime).toISOString() : 'none'
    });

    sortedReplies.forEach(reply => {
      console.log('Processing reply:', {
        created_at: reply.created_at,
        author: reply.author
      });

      if (reply.author.roles?.includes('PARTICIPANT')) {
        participantMessages++;
        lastParticipantTime = new Date(reply.created_at).getTime();
      } else if (reply.author.roles?.includes('EXPERT')) {
        expertReplies++;
        lastExpertTime = new Date(reply.created_at).getTime();
      }
    });

    const needsAttention = lastParticipantTime > lastExpertTime || expertReplies < participantMessages;

    console.log('Final state:', {
      participantMessages,
      expertReplies,
      lastParticipantTime: new Date(lastParticipantTime).toISOString(),
      lastExpertTime: lastExpertTime ? new Date(lastExpertTime).toISOString() : 'none',
      needsAttention,
      reason: needsAttention ?
        (lastParticipantTime > lastExpertTime ? 'NEEDS_REPLY' : 'INSUFFICIENT_REPLIES')
        : 'FULLY_ANSWERED'
    });

    return {
      needsAttention,
      participantCount: participantMessages,
      expertCount: expertReplies,
      reason: needsAttention ?
        (lastParticipantTime > lastExpertTime ? 'NEEDS_REPLY' : 'INSUFFICIENT_REPLIES')
        : 'FULLY_ANSWERED'
    };
  };

  const counts = topics.reduce((acc, topic) => {
    const status = getTopicStatus(topic);

    if (status.needsAttention) {
      acc.needsAttention++;
      acc.awaitingResponse++;
    } else if (topic.status === 'ANSWERED') {
      acc.answered++;
    } else if (topic.status === 'CLOSED') {
      acc.closed++;
    }

    return acc;
  }, {
    needsAttention: 0,
    awaitingResponse: 0,
    answered: 0,
    closed: 0
  });

  const filteredTopics = topics.filter(topic => {
    if (!isExpertUser()) {
      return (categoryFilter === 'all' || topic.category === categoryFilter) &&
        (topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // For experts, show topics needing attention
    if (showUnansweredOnly) {
      const status = getTopicStatus(topic);
      return status.needsAttention;
    }

    return !showUnansweredOnly;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      {isExpertUser() ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Expert Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 px-4 py-2 rounded-lg">
                <span className="font-semibold text-primary">{counts.needsAttention}</span>
                <span className="text-gray-600 ml-2">Topics need your expertise</span>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUnansweredOnly}
                  onChange={(e) => setShowUnansweredOnly(e.target.checked)}
                  className="form-checkbox text-primary"
                />
                <span className="text-gray-600">Show unanswered only</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 justify-center bg-green-50 p-3 rounded-lg">
              <span className="font-semibold text-green-600">
                {counts.awaitingResponse}
              </span>
              <span className="text-gray-600">Awaiting Response</span>
            </div>
            <div className="flex items-center gap-2 justify-center bg-blue-50 p-3 rounded-lg">
              <span className="font-semibold text-blue-600">
                {counts.answered}
              </span>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2 justify-center bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold text-gray-600">
                {counts.closed}
              </span>
              <span className="text-gray-600">Closed</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Herpes Forum</h1>
          <div className="flex items-center gap-4">
            {/* Only show payment history to non-expert users */}
            {user && !userRoles?.includes('EXPERT') && (
              <Link
                href="/account/payment-history"
                className="btn-secondary flex items-center gap-2"
              >
                View Payment History
              </Link>
            )}
            {/* Only show New Question button to non-expert users */}
            {(!user || !userRoles?.includes('EXPERT')) && (
              <Link
                href="/forum/new"
                className="btn-primary flex items-center gap-2"
              >
                <FaPlus /> New Question
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Categories filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <FaFilter className="text-gray-400" />
          <select
            className="form-select text-sm"
            defaultValue="all"
          >
            <option value="all">All Categories</option>
            <option value="testing">Testing & Diagnosis</option>
            <option value="treatment">Treatment Options</option>
            <option value="general">General Questions</option>
          </select>
        </div>
      </div>

      {/* Search bar and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="p-2 border rounded-lg"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="testing">Testing & Diagnosis</option>
            <option value="treatment">Treatment Options</option>
            <option value="general">General Questions</option>
          </select>
        </div>
      </div>

      {/* Topics list */}
      <div className="space-y-4">
        {filteredTopics
          .sort((a, b) =>
            sortBy === 'newest'
              ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          .map((topic) => (
            <div
              key={topic.id}
              onClick={() => handleTopicClick(topic.id)}
              className={`cursor-pointer bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${topic.status === 'OPEN' ? 'border-l-4 border-primary' :
                topic.status === 'ANSWERED' ? 'border-l-4 border-green-500' :
                  'border-l-4 border-gray-300'
                }`}
            >
              <Link href={`/forum/${topic.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold hover:text-primary">
                      {topic.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Posted by {topic.author?.display_name} in {topic.category}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${topic.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    topic.status === 'ANSWERED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {topic.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {format(new Date(topic.created_at), 'MMM d, yyyy')}
                </p>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
} 
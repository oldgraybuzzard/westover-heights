import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, Topic, Reply } from '@/lib/supabase/client';
import { format } from 'date-fns';
import Link from 'next/link';

export default function TopicDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopic() {
      if (!id) return;

      try {
        // Load topic with author
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select(`
            *,
            author:profiles(*)
          `)
          .eq('id', id)
          .single();

        if (topicError) throw topicError;
        setTopic(topicData);

        // Load replies with authors
        const { data: repliesData, error: repliesError } = await supabase
          .from('replies')
          .select(`
            *,
            author:profiles(*)
          `)
          .eq('topic_id', id)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;
        setReplies(repliesData || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!topic) return <div>Topic not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/topics"
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← Back to Topics
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{topic.title}</h1>
            <span className={`px-2 py-1 rounded text-sm ${topic.status === 'OPEN' ? 'bg-green-100 text-green-800' :
              topic.status === 'ANSWERED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {topic.status}
            </span>
          </div>

          <div className="text-gray-600 mb-2">
            Posted by {topic.author?.display_name} in {topic.category}
          </div>

          <div className="text-gray-500 text-sm mb-4">
            {format(new Date(topic.created_at), 'MMM d, yyyy')}
          </div>

          <div className="prose max-w-none">
            {topic.content}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Replies</h2>

        {replies.map((reply) => (
          <div
            key={reply.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="font-medium">
                  {reply.author?.display_name}
                  {reply.author?.role === 'EXPERT' && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      Expert
                    </span>
                  )}
                </div>
              </div>
              <div className="text-gray-500 text-sm">
                {format(new Date(reply.created_at), 'MMM d, yyyy')}
              </div>
            </div>

            <div className="prose max-w-none">
              {reply.content}
            </div>
          </div>
        ))}

        {/* Reply form will go here */}
      </div>
    </div>
  );
} 
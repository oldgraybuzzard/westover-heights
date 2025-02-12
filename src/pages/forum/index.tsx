import { useEffect, useState } from 'react';
import { supabase, Topic } from '@/lib/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToRoleChanges } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadTopics() {
      try {
        console.log('Loading topics...');

        const { data, error } = await supabase
          .from('topics')
          .select(`
            *,
            author:profiles(*)
          `)
          .order('created_at', { ascending: false });

        console.log('Topics data:', data);

        if (error) {
          throw error;
        }

        if (mounted) {
          setTopics(data || []);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Herpes Forum</h1>
        <Link
          href="/forum/new"
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> New Question
        </Link>
      </div>

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

      {/* Topics list */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
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
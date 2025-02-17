'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ExpertTopic } from '@/types/expert';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ExpertDashboard() {
  const { user, isExpert } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<ExpertTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    answered: 0,
    averageResponseTime: 0
  });

  useEffect(() => {
    if (!isExpert()) {
      router.push('/unauthorized');
      return;
    }
  }, [isExpert, router]);

  useEffect(() => {
    fetchTopics();
    calculateStats();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_dashboard')
        .select('*')
        .limit(10);

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const { data: allTopics, error } = await supabase
        .from('topics')
        .select('status, created_at, answered_at');

      if (error) throw error;

      const stats = allTopics.reduce((acc, topic) => {
        // Count by status
        if (topic.status === 'pending') acc.pending++;
        if (topic.status === 'in_progress') acc.inProgress++;
        if (topic.status === 'answered') {
          acc.answered++;
          // Calculate response time
          if (topic.answered_at) {
            const responseTime = new Date(topic.answered_at).getTime() - new Date(topic.created_at).getTime();
            acc.totalResponseTime += responseTime;
            acc.responseCount++;
          }
        }
        return acc;
      }, {
        pending: 0,
        inProgress: 0,
        answered: 0,
        totalResponseTime: 0,
        responseCount: 0
      });

      setStats({
        pending: stats.pending,
        inProgress: stats.inProgress,
        answered: stats.answered,
        averageResponseTime: stats.responseCount
          ? Math.round(stats.totalResponseTime / stats.responseCount / (1000 * 60 * 60)) // Convert to hours
          : 0
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const assignToSelf = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({
          status: 'in_progress',
          assigned_expert_id: user?.id
        })
        .eq('id', topicId);

      if (error) throw error;

      setTopics(topics.map(topic =>
        topic.topic_id === topicId
          ? { ...topic, status: 'in_progress', assigned_expert_id: user?.id }
          : topic
      ));
      toast.success('Topic assigned to you');
    } catch (error) {
      console.error('Error assigning topic:', error);
      toast.error('Failed to assign topic');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Expert Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Pending Questions</h3>
          <p className="text-3xl font-bold text-primary mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Answered</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.answered}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Avg. Response Time</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.averageResponseTime}h</p>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Questions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {topics.map(topic => (
            <div key={topic.topic_id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/expert/questions/${topic.topic_id}`}
                    className="text-lg font-medium text-gray-900 hover:text-primary"
                  >
                    {topic.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-600">{topic.content.substring(0, 150)}...</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>By {topic.author_name}</span>
                    <span>{format(new Date(topic.created_at), 'MMM d, yyyy')}</span>
                    <span>{topic.reply_count} replies</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${topic.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    topic.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {topic.status.replace('_', ' ').charAt(0).toUpperCase() + topic.status.slice(1)}
                  </span>
                  {topic.status === 'pending' && (
                    <button
                      onClick={() => assignToSelf(topic.topic_id)}
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    >
                      Take Question
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
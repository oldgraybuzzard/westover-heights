import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { FaArrowLeft, FaReply } from 'react-icons/fa';

interface Reply {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  isExpert: boolean;
}

interface TopicData {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  status: 'open' | 'closed' | 'answered';
  replies: Reply[];
}

const TopicPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  // Mock data - replace with API call
  const topic: TopicData = {
    id: '1',
    title: 'Question About Test and Next Steps',
    content: 'Lorem ipsum dolor sit amet...',
    author: 'faulknerfan23',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: 'open',
    replies: [
      {
        id: '1',
        author: 'Terri Warren',
        content: 'Based on your description...',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        isExpert: true,
      },
    ],
  };

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
          <span className={`px-3 py-1 rounded-full text-sm ${topic.status === 'answered' ? 'bg-green-100 text-green-800' :
            topic.status === 'closed' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
            {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
          </span>
        </div>
        <div className="prose max-w-none mb-4">
          {topic.content}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-4">
          <span>Posted by {topic.author}</span>
          <span>•</span>
          <span>{formatDistanceToNow(topic.createdAt, { addSuffix: true })}</span>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-6">
        {topic.replies.map((reply) => (
          <div key={reply.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{reply.author}</span>
                {reply.isExpert && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    Expert
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {format(reply.createdAt, 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <div className="prose max-w-none">
              {reply.content}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form for Logged-in Users */}
      {user && topic.status === 'open' && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Post a Reply</h2>
          <form className="space-y-4">
            <textarea
              rows={4}
              className="form-textarea w-full"
              placeholder="Write your reply..."
            />
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FaReply /> Post Reply
            </button>
          </form>
        </div>
      )}

      {/* Info for Non-logged in Users */}
      {!user && (
        <div className="mt-8 bg-primary/5 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            Sign in to post replies and participate in discussions.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/register" className="btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      )}
    </main>
  );
};

export default TopicPage; 
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ForumTopicList from '@/components/forum/ForumTopicList';
import Pagination from '@/components/forum/Pagination';
import { FaPlus, FaFilter } from 'react-icons/fa';

const TOPICS_PER_PAGE = 20;

const ForumPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - replace with actual API call
  const topics = [
    {
      id: '1',
      title: 'Question About Test and Next Steps',
      author: 'faulknerfan23',
      forum: 'Herpes Questions',
      replies: 1,
      lastPost: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      status: 'open' as const,
    },
    // ... more topics
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'herpes-questions', name: 'Herpes Questions' },
    { id: 'testing', name: 'Testing & Diagnosis' },
    { id: 'treatment', name: 'Treatment Options' },
  ];

  const statuses = [
    { id: 'all', name: 'All Statuses' },
    { id: 'open', name: 'Open' },
    { id: 'answered', name: 'Answered' },
    { id: 'closed', name: 'Closed' },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Herpes Forum</h1>
        {user && (
          <Link href="/forum/new" className="btn-primary flex items-center gap-2">
            <FaPlus /> New Question
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <FaFilter className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select text-sm"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select text-sm"
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forum List */}
      <ForumTopicList topics={topics} />

      {/* Pagination */}
      <Pagination
        currentPage={1}
        totalPages={5}
        baseUrl="/forum"
      />

      {/* Info for Non-logged in Users */}
      {!user && (
        <div className="mt-8 bg-primary/5 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Want to Ask a Question?
          </h2>
          <p className="text-gray-600 mb-4">
            Sign in or create an account to post questions and participate in discussions.
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

export default ForumPage; 
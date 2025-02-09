import React from 'react';
import { Question } from '@/types';
import Link from 'next/link';

interface AdminDashboardProps {
  pendingQuestions: Question[];
  answeredQuestions: Question[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  pendingQuestions,
  answeredQuestions,
}) => {
  return (
    <div className="space-y-8">
      {/* Pending Questions Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pending Questions ({pendingQuestions.length})
        </h2>
        <div className="space-y-4">
          {pendingQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Link
                href={`/admin/questions/${question.id}`}
                className="block"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {question.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {question.content}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Posted: {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    Follow-ups: {question.followUpCount}/2
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Answered Questions Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recently Answered Questions
        </h2>
        <div className="space-y-4">
          {answeredQuestions.slice(0, 5).map((question) => (
            <div
              key={question.id}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Link
                href={`/admin/questions/${question.id}`}
                className="block"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {question.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Answered: {new Date(question.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Answered
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
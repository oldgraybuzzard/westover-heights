import React from 'react';
import Link from 'next/link';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <Link 
        href={`/questions/${question.id}`}
        className="block"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {question.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {question.content}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded-full ${
              question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              question.status === 'answered' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
            </span>
            <span>
              {question.followUpCount} follow-up{question.followUpCount !== 1 ? 's' : ''}
            </span>
          </div>
          <span>
            {new Date(question.createdAt).toLocaleDateString()}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default QuestionCard; 
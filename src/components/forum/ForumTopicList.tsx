import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  forum: string;
  replies: number;
  lastPost: Date;
  status: 'open' | 'closed' | 'answered';
}

interface ForumTopicListProps {
  topics: ForumTopic[];
}

const ForumTopicList: React.FC<ForumTopicListProps> = ({ topics }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Replies
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Post
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {topics.map((topic) => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link 
                    href={`/forum/topic/${topic.id}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    {topic.title}
                  </Link>
                  <div className="text-sm text-gray-500">
                    by {topic.author} in {topic.forum}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {topic.replies}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDistanceToNow(topic.lastPost, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForumTopicList; 
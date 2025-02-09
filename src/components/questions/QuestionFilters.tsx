import React from 'react';

interface QuestionFiltersProps {
  status: string;
  sortBy: string;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  status,
  sortBy,
  onStatusChange,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="answered">Answered</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      
      <div className="flex-1">
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostFollowUps">Most Follow-ups</option>
          <option value="leastFollowUps">Least Follow-ups</option>
        </select>
      </div>
    </div>
  );
};

export default QuestionFilters; 
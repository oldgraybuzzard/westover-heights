import React from 'react';

interface Stats {
  totalQuestions: number;
  pendingQuestions: number;
  answeredQuestions: number;
  averageResponseTime: string;
  totalRevenue: number;
  questionsThisMonth: number;
}

interface StatsOverviewProps {
  stats: Stats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          title: 'Total Questions',
          value: stats.totalQuestions,
          change: `${stats.questionsThisMonth} this month`,
          color: 'bg-blue-500',
        },
        {
          title: 'Pending Questions',
          value: stats.pendingQuestions,
          change: `${((stats.pendingQuestions / stats.totalQuestions) * 100).toFixed(1)}%`,
          color: 'bg-yellow-500',
        },
        {
          title: 'Average Response Time',
          value: stats.averageResponseTime,
          change: 'Last 30 days',
          color: 'bg-green-500',
        },
        {
          title: 'Total Revenue',
          value: `$${stats.totalRevenue.toLocaleString()}`,
          change: 'All time',
          color: 'bg-purple-500',
        },
        {
          title: 'Response Rate',
          value: `${(((stats.totalQuestions - stats.pendingQuestions) / stats.totalQuestions) * 100).toFixed(1)}%`,
          change: 'Questions answered',
          color: 'bg-indigo-500',
        },
        {
          title: 'Questions This Month',
          value: stats.questionsThisMonth,
          change: `${((stats.questionsThisMonth / stats.totalQuestions) * 100).toFixed(1)}% of total`,
          color: 'bg-pink-500',
        },
      ].map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
              <span className="text-white text-xl">
                {/* Add icons here if needed */}
              </span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview; 
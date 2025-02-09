import React from 'react';
import { GetServerSideProps } from 'next';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import StatsOverview from '@/components/admin/analytics/StatsOverview';
import TrendsChart from '@/components/admin/analytics/TrendsChart';
import api from '@/lib/api';

interface AnalyticsData {
  stats: {
    totalQuestions: number;
    pendingQuestions: number;
    answeredQuestions: number;
    averageResponseTime: string;
    totalRevenue: number;
    questionsThisMonth: number;
  };
  trends: {
    date: string;
    questions: number;
    responses: number;
    revenue: number;
  }[];
}

interface AnalyticsPageProps {
  initialData: AnalyticsData;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ initialData }) => {
  useProtectedRoute(true);
  const [data, setData] = React.useState(initialData);
  const [selectedMetric, setSelectedMetric] = React.useState<'questions' | 'responses' | 'revenue'>('questions');
  const [timeRange, setTimeRange] = React.useState('30d');

  const updateData = async () => {
    try {
      const response = await api.get(`/api/admin/analytics?range=${timeRange}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };

  React.useEffect(() => {
    updateData();
  }, [timeRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your platform's performance and metrics
        </p>
      </div>

      <div className="mb-8">
        <StatsOverview stats={data.stats} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-x-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="rounded-md border-gray-300"
            >
              <option value="questions">Questions</option>
              <option value="responses">Responses</option>
              <option value="revenue">Revenue</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-md border-gray-300"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
        <TrendsChart
          data={data.trends}
          metric={selectedMetric}
        />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // This will be replaced with actual API call
    const initialData: AnalyticsData = {
      stats: {
        totalQuestions: 0,
        pendingQuestions: 0,
        answeredQuestions: 0,
        averageResponseTime: '0h',
        totalRevenue: 0,
        questionsThisMonth: 0,
      },
      trends: [],
    };

    return {
      props: {
        initialData,
      },
    };
  } catch (error) {
    console.error('Failed to fetch initial analytics data:', error);
    return {
      props: {
        initialData: null,
      },
    };
  }
};

export default AnalyticsPage; 
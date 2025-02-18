import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  date: string;
  questions: number;
  responses: number;
  revenue: number;
}

interface TrendsChartProps {
  data: TrendData[];
  metric: 'questions' | 'responses' | 'revenue';
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, metric }) => {
  const getMetricColor = () => {
    switch (metric) {
      case 'questions':
        return '#3B82F6';
      case 'responses':
        return '#10B981';
      case 'revenue':
        return '#8B5CF6';
      default:
        return '#3B82F6';
    }
  };

  const formatYAxis = (value: number): string => {
    if (metric === 'revenue') {
      return `$${value}`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip
              formatter={(value: number) =>
                metric === 'revenue' ? `$${value}` : value
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={getMetricColor()}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart; 
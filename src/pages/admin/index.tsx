import React from 'react';
import { GetServerSideProps } from 'next';
import { Question } from '@/types';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

interface AdminPageProps {
  pendingQuestions: Question[];
  answeredQuestions: Question[];
}

const AdminPage: React.FC<AdminPageProps> = ({
  pendingQuestions: initialPending,
  answeredQuestions: initialAnswered,
}) => {
  useProtectedRoute(true); // Ensure only admins can access
  const [pendingQuestions, setPendingQuestions] = React.useState(initialPending);
  const [answeredQuestions, setAnsweredQuestions] = React.useState(initialAnswered);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Admin Dashboard
      </h1>
      <AdminDashboard
        pendingQuestions={pendingQuestions}
        answeredQuestions={answeredQuestions}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // This will be replaced with actual API calls
    const pendingQuestions: Question[] = [];
    const answeredQuestions: Question[] = [];

    return {
      props: {
        pendingQuestions,
        answeredQuestions,
      },
    };
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return {
      props: {
        pendingQuestions: [],
        answeredQuestions: [],
      },
    };
  }
};

export default AdminPage; 
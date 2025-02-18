import React from 'react';
import { GetServerSideProps } from 'next';
import { Question } from '@/types';
import QuestionsList from '@/components/questions/QuestionsList';
import api from '@/lib/api';
import QuestionFilters from '@/components/questions/QuestionFilters';

interface QuestionsPageProps {
  initialQuestions: Question[];
  totalPages: number;
}

const QuestionsPage: React.FC<QuestionsPageProps> = ({ initialQuestions, totalPages: initialTotalPages }) => {
  const [questions, setQuestions] = React.useState<Question[]>(initialQuestions);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(initialTotalPages);
  const [status, setStatus] = React.useState('');
  const [sortBy, setSortBy] = React.useState('newest');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/questions', {
        params: {
          page: currentPage,
          status,
          sort: sortBy,
          search: searchTerm,
        },
      });
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchQuestions();
  }, [currentPage, status, sortBy]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setLoading(true);

    try {
      const response = await api.get(`/api/questions/search?q=${term}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to search questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Medical Questions & Answers
        </h1>
        <div className="max-w-xl mb-6">
          <input
            type="search"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <QuestionFilters
          status={status}
          sortBy={sortBy}
          onStatusChange={setStatus}
          onSortChange={setSortBy}
        />
      </div>

      <QuestionsList
        questions={questions}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // This will be replaced with actual API call once backend is ready
    const initialQuestions: Question[] = [
      {
        id: '1',
        title: 'Sample Medical Question',
        content: 'This is a sample medical question content...',
        authorId: 'user1',
        isAnonymous: true,
        status: 'pending',
        followUpCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add more sample questions as needed
    ];

    return {
      props: {
        initialQuestions,
        totalPages: 1, // Assuming a single page for the example
      },
    };
  } catch (error) {
    console.error('Failed to fetch initial questions:', error);
    return {
      props: {
        initialQuestions: [],
        totalPages: 1, // Assuming a single page for the example
      },
    };
  }
};

export default QuestionsPage; 
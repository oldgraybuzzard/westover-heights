import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Question, Answer } from '@/types';
import { useAuth } from '@/context/AuthContext';
import QuestionResponse from '@/components/admin/QuestionResponse';
import api from '@/lib/api';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

interface AdminQuestionDetailProps {
  question: Question;
  answers: Answer[];
}

const AdminQuestionDetail: React.FC<AdminQuestionDetailProps> = ({
  question: initialQuestion,
  answers: initialAnswers,
}) => {
  useProtectedRoute(true); // Ensure only admins can access
  const router = useRouter();
  const [question, setQuestion] = React.useState(initialQuestion);
  const [answers, setAnswers] = React.useState(initialAnswers);

  const handleAnswerSubmitted = (newAnswer: Answer) => {
    setAnswers([...answers, newAnswer]);
    setQuestion({ ...question, status: 'answered' });
  };

  const handleCloseQuestion = async () => {
    try {
      await api.patch(`/api/questions/${question.id}`, {
        status: 'closed',
      });
      setQuestion({ ...question, status: 'closed' });
    } catch (error) {
      console.error('Failed to close question:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            question.status === 'answered' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
          </span>
        </div>
        <div className="prose max-w-none mb-6">
          {question.content}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Posted: {new Date(question.createdAt).toLocaleDateString()}</span>
          <span>Follow-ups: {question.followUpCount}/2</span>
        </div>
      </div>

      {/* Previous Answers */}
      {answers.length > 0 && (
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Previous Responses</h2>
          {answers.map((answer) => (
            <div key={answer.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="prose max-w-none mb-4">{answer.content}</div>
              <div className="text-sm text-gray-500">
                Responded: {new Date(answer.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Form */}
      {question.status !== 'closed' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <QuestionResponse
            question={question}
            onAnswerSubmitted={handleAnswerSubmitted}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
        {question.status === 'answered' && (
          <button
            onClick={handleCloseQuestion}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Close Question
          </button>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    // This will be replaced with actual API calls
    const question: Question = {
      id: params?.id as string,
      title: 'Sample Question',
      content: 'Sample content...',
      authorId: 'user1',
      isAnonymous: true,
      status: 'pending',
      followUpCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const answers: Answer[] = [];

    return {
      props: {
        question,
        answers,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default AdminQuestionDetail; 
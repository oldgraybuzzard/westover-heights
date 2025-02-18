import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Question, Answer } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface QuestionDetailPageProps {
  question: Question;
  answers: Answer[];
}

const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ question, answers: initialAnswers }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [answers, setAnswers] = React.useState(initialAnswers);
  const [followUpContent, setFollowUpContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/api/questions/${question.id}/followup`, {
        content: followUpContent,
      });
      setAnswers([...answers, response.data]);
      setFollowUpContent('');
    } catch (error) {
      console.error('Failed to submit follow-up:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        <div className="prose max-w-none mb-6">{question.content}</div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className={`px-2 py-1 rounded-full ${question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              question.status === 'answered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
          </span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-6 mb-8">
        {answers.map((answer) => (
          <div key={answer.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="prose max-w-none mb-4">{answer.content}</div>
            <div className="text-sm text-gray-500">
              {new Date(answer.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Follow-up Form */}
      {user && question.status !== 'closed' && question.followUpCount < 2 && (
        <form onSubmit={handleFollowUp} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add a Follow-up Question</h3>
          <textarea
            value={followUpContent}
            onChange={(e) => setFollowUpContent(e.target.value)}
            className="w-full p-2 border rounded-md mb-4"
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Follow-up'}
          </button>
        </form>
      )}
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
      createdAt: new Date(),
      updatedAt: new Date(),
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

export default QuestionDetailPage; 
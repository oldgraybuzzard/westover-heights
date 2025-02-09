import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import RichTextEditor from '@/components/questions/RichTextEditor';
import PaymentForm from '@/components/payment/PaymentForm';
import api from '@/lib/api';

const AskQuestionPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);
  const [showPayment, setShowPayment] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!content.trim()) {
      newErrors.content = 'Question content is required';
    }
    if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const response = await api.post('/api/questions', {
        title,
        content,
        isAnonymous,
        paymentIntentId,
      });

      router.push(`/questions/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create question:', error);
      setErrors({ submit: 'Failed to create question. Please try again.' });
    }
  };

  const handlePaymentError = (error: string) => {
    setErrors({ payment: error });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ask a Question</h1>

      {!showPayment ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Question Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter your question title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Details
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              error={errors.content}
              placeholder="Provide details about your question..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
              Post anonymously
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Continue to Payment
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <div className="mb-6">
            <p className="text-gray-600">
              Your question will be posted after successful payment of $25.
              This includes two follow-up questions.
            </p>
          </div>
          <PaymentForm
            amount={25}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
          {errors.payment && (
            <p className="mt-4 text-sm text-red-500">{errors.payment}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AskQuestionPage; 
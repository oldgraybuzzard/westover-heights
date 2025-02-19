import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from '@/components/questions/RichTextEditor';
import PaymentForm from '@/components/PaymentForm';
import api from '@/lib/api';
import { updateCanPost } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

const AskQuestionPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);
  const [showPayment, setShowPayment] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

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

    try {
      // First check if user can post
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('can_post, post_count')
        .single();

      if (profileError) throw profileError;
      if (!profile.can_post) {
        toast.error('You need to purchase credits to post a question');
        return;
      }

      // Create the topic
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          encrypted_content: content.trim(),
          author_id: user?.id,
          status: 'PENDING',
          category: selectedCategory || 'GENERAL'
        })
        .select()
        .single();

      if (topicError) {
        console.error('Topic creation error:', topicError);
        throw topicError;
      }

      toast.success('Question posted successfully!');
      router.push(`/questions/${topic.id}`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post question');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use the updateCanPost function from supabase client
      await updateCanPost(user.id, paymentIntentId);

      // Create the topic
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .insert({
          title,
          content,
          author_id: user.id,
          is_anonymous: isAnonymous,
          status: 'pending'
        })
        .select()
        .single();

      if (topicError) throw topicError;

      router.push(`/questions/${topic.id}`);
    } catch (error) {
      console.error('Failed to create question:', error);
      setErrors({ submit: 'Failed to create question. Please try again.' });
    }
  };

  const handlePaymentError = (error: Error) => {
    setErrors(prev => ({ ...prev, payment: error.message }));
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
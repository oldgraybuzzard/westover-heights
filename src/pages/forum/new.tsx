import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, updateCanPost } from '@/lib/supabase/client';
import PaymentModal from '@/components/PaymentModal';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function NewTopicPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      console.log('No user, redirecting to login');
      router.push({
        pathname: '/login',
        query: { returnTo: '/forum/new' }
      });
    }
  }, [user, router]);

  useEffect(() => {
    async function checkPostingPermission() {
      if (!user) {
        console.log('No user, skipping check');
        return;
      }

      try {
        console.log('Starting permission check for user:', user.id);

        const [profileResult, topicsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('can_post, post_count')
            .eq('id', user.id)
            .single(),
          supabase
            .from('topics')
            .select('id', { count: 'exact' })
            .eq('author_id', user.id)
            .eq('status', 'OPEN')
        ]);

        console.log('Profile result:', profileResult.data);
        console.log('Topics result:', topicsResult);

        if (profileResult.error) throw profileResult.error;
        if (topicsResult.error) throw topicsResult.error;

        const hasOpenTopics = (topicsResult.count || 0) > 0;
        const hasValidPayment = profileResult.data?.can_post === true &&
          (profileResult.data?.post_count ?? 0) < 3;

        console.log('Has open topics:', hasOpenTopics);
        console.log('Has valid payment:', hasValidPayment);
        console.log('Post count:', profileResult.data?.post_count);
        console.log('Can post:', profileResult.data?.can_post);

        setProfile(profileResult.data);

        if (hasOpenTopics) {
          toast.error('Please wait for your existing question to be answered before posting a new one');
          router.push('/forum');
          return;
        }

        if (!hasValidPayment) {
          console.log('Showing payment modal');
          setShowPaymentModal(true);
          setCanPost(false);
        } else {
          console.log('User can post');
          setCanPost(true);
        }
      } catch (e) {
        console.error('Error checking posting permission:', e);
        setCanPost(false);
        setShowPaymentModal(true);
      }
    }

    checkPostingPermission();
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  if (canPost === null) {
    console.log('Still checking can_post status');
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canPost) {
      setShowPaymentModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Please sign in to create a topic');
      }

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      // Use the create_topic function
      const { data: topic, error: topicError } = await supabase
        .rpc('create_topic', {
          p_title: formData.get('title'),
          p_content: formData.get('content'),
          p_category: formData.get('category') || 'GENERAL',
          p_author_id: user.id
        });

      if (topicError) throw topicError;

      router.push(`/forum/${topic}`);
    } catch (e) {
      console.error('Form submission error:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Common content for both states
  const pageContent = !canPost ? (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <p className="text-gray-600 mb-4">
        {profile?.post_count >= 3
          ? "You've reached your post limit. A payment of $25 is required for a new question."
          : "To post questions, a payment of $25 is required. This allows you to post 1 question and 2 follow-up questions. Note: You can only have one open question at a time."}
      </p>
      <button
        onClick={() => setShowPaymentModal(true)}
        className="btn-primary"
      >
        Continue ($25 for 3 posts)
      </button>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p className="font-medium">Error submitting form:</p>
          <p>{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          name="category"
          required
          className="form-select w-full"
        >
          <option value="General Questions">General Questions</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          required
          className="form-input w-full"
          placeholder="What's your question?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Details
        </label>
        <textarea
          name="content"
          required
          rows={6}
          className="form-textarea w-full"
          placeholder="Provide as much detail as possible..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 hover:bg-green-200 font-bold rounded-md shadow-sm hover:shadow transition-all duration-200 border border-green-300"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Submitting...
            </>
          ) : (
            'Submit Question'
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in bg-gradient-to-b from-gray-200 to-gray-100">
      <Link
        href="/forum"
        className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Forum
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ask a Question</h1>

      {/* Form container */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-primary/10 hover:shadow-lg transition-shadow duration-300">
        {pageContent}
      </div>

      {/* Single PaymentModal instance */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async (paymentIntentId) => {
          if (user) {
            await updateCanPost(user.id, paymentIntentId);
            setCanPost(true);
            setShowPaymentModal(false);
            toast.success('You can now post your question!');
          }
        }}
        mode="new"
      />
    </div>
  );
} 

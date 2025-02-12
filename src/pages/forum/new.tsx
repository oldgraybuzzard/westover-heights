import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, updateCanPost } from '@/lib/supabase/client';
import PaymentModal from '@/components/PaymentModal';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function NewTopicPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkPostingPermission() {
      if (!user) {
        console.log('No user found, skipping permission check');
        return;
      }

      try {
        console.log('Checking posting permission for user:', user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('can_post, post_count')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        console.log('Profile data:', profile);
        setProfile(profile);
        // Only allow posting if they've paid AND have posts remaining
        const canPostNow = profile?.can_post && (profile?.post_count ?? 0) < 3;
        console.log('Can post status:', canPostNow);

        if (!canPostNow) {
          console.log('User cannot post, showing payment modal');
          setShowPaymentModal(true);
        }
        setCanPost(canPostNow);
      } catch (e) {
        console.error('Error checking posting permission:', e);
        setCanPost(false);
        setShowPaymentModal(true);
      }
    }

    checkPostingPermission();
  }, [user]);

  if (!user) {
    console.log('No user, redirecting to login');
    router.push({
      pathname: '/login',
      query: { returnTo: '/forum/new' }
    });
    return null;
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

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      if (!user) {
        throw new Error('Please sign in to create a topic');
      }

      // Start a transaction to create topic and update post count
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .insert({
          title: formData.get('title'),
          content: formData.get('content'),
          category: formData.get('category'),
          author_id: user.id,
          status: 'OPEN'
        })
        .select()
        .single();

      if (topicError) throw topicError;

      // Increment post count
      const { error: updateError } = await supabase.rpc('increment_post_count');
      if (updateError) throw updateError;

      router.push(`/forum/${topic.id}`);
    } catch (e) {
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
          : "To post questions, a payment of $25 is required. This allows you to post 1 question and 2 follow-up questions."}
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
          {error}
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
          <option value="Testing & Diagnosis">Testing & Diagnosis</option>
          <option value="Treatment Options">Treatment Options</option>
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
          className="btn-primary"
        >
          {loading ? 'Posting...' : (canPost ? 'Post Question' : 'Continue ($25 for 3 posts)')}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-16 animate-fade-in">
      <Link
        href="/forum"
        className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Forum
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ask a Question</h1>

      {pageContent}

      {/* Single PaymentModal instance */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async () => {
          if (user) {
            await updateCanPost(user.id);
            setCanPost(true);
            setShowPaymentModal(false);
            toast.success('You can now post your question!');
          }
        }}
      />
    </div>
  );
} 
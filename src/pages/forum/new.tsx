import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import PaymentModal from '@/components/PaymentModal';

export default function NewTopicPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General Questions');

  useEffect(() => {
    if (!user) {
      console.log('No user, redirecting to login');
      router.push('/login?redirect=/forum/new');
      return;
    }

    console.log('Still checking can_post status');

    async function checkPostingPermission() {
      try {
        console.log('Starting permission check for user:', user.id);

        // First check if the user has any payment history
        const { data: paymentHistory, error: paymentError } = await supabase
          .from('payment_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const hasRecentPayment = paymentHistory && paymentHistory.length > 0;
        
        // Then check profile and open topics
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

        setProfile(profileResult.data);

        const hasValidPayment = hasRecentPayment || profileResult.data?.can_post;
        const hasOpenTopics = topicsResult.count && topicsResult.count > 0;

        console.log('Payment history:', hasRecentPayment);
        console.log('Has open topics:', hasOpenTopics);
        console.log('Has valid payment:', hasValidPayment);
        console.log('Post count:', profileResult.data?.post_count);
        console.log('Can post:', profileResult.data?.can_post);

        // If they have a recent payment but profile wasn't updated, fix it now
        if (hasRecentPayment && !profileResult.data?.can_post) {
          console.log('Found payment but profile not updated, fixing...');
          await supabase
            .from('profiles')
            .update({ 
              can_post: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          // Set can post to true since we just fixed it
          setCanPost(true);
        } else if (!hasValidPayment) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      if (!content.trim()) {
        throw new Error('Content is required');
      }

      if (!user) {
        throw new Error('You must be logged in to post');
      }

      console.log('Creating new topic...');
      
      // Create the topic directly without using any RPC functions
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category: selectedCategory,
          author_id: user.id,
          status: 'OPEN'
        })
        .select()
        .single();

      if (topicError) {
        console.error('Topic creation error:', topicError);
        throw topicError;
      }

      console.log('Topic created successfully:', topicData);
      
      // Manually update the profile post count
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('post_count')
        .eq('id', user.id)
        .single();
      
      if (profileFetchError) {
        console.error('Error fetching profile:', profileFetchError);
      } else {
        const currentCount = profileData?.post_count || 0;
        
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ 
            post_count: currentCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (profileUpdateError) {
          console.error('Error updating profile:', profileUpdateError);
        }
      }

      toast.success('Your question has been posted!');
      router.push(`/forum/topic/${topicData.id}`);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to create topic');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>
      
      {canPost === false && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
          <p className="font-medium">You need to make a payment before posting.</p>
          <p>Each payment allows you to post one question with up to two follow-up questions.</p>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="mt-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md"
          >
            Make Payment
          </button>
        </div>
      )}
      
      {canPost && (
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="form-textarea w-full"
              placeholder="Provide as much detail as possible..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 hover:bg-green-200 font-bold rounded-md shadow-sm hover:shadow transition-all duration-200 border border-green-300"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Question'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Single PaymentModal instance */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async (paymentIntentId) => {
          if (user) {
            try {
              // Directly update the profile
              await supabase
                .from('profiles')
                .update({ 
                  can_post: true,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
                
              // Create payment history record
              await supabase
                .from('payment_history')
                .insert({
                  user_id: user.id,
                  payment_intent_id: paymentIntentId,
                  amount: 2500,
                  posts_remaining: 3,
                  status: 'active'
                });
                
              setCanPost(true);
              setShowPaymentModal(false);
              toast.success('You can now post your question!');
            } catch (error) {
              console.error('Error updating user permissions:', error);
              toast.error('There was an error updating your account. Please try again.');
            }
          }
        }}
        mode="new"
      />
    </div>
  );
} 

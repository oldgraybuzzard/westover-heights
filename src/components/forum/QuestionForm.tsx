import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface QuestionFormProps {
  onPaymentRequired: () => void;
  canPost: boolean;
}

export default function QuestionForm({ onPaymentRequired, canPost }: QuestionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canPost) {
      onPaymentRequired();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('Please sign in to create a topic');

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

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

      await supabase.rpc('increment_post_count', { user_id: user.id });
      router.push(`/forum/${topic.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          className="btn-primary"
        >
          {loading ? 'Posting...' : 'Post Question'}
        </button>
      </div>
    </form>
  );
} 

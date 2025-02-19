import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Payment {
  id: string;
  user_id: string;
  payment_intent_id: string;
  amount: number;
  status: 'active' | 'pending' | 'cancelled' | 'refunded' | 'inactive';
  posts_remaining: number;
  created_at: string;
}

interface PaymentHistoryProps {
  userId: string;
  onUpdate?: () => void;
}

export default function PaymentHistory({ userId, onUpdate }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch payment history when component mounts
  useEffect(() => {
    fetchPaymentHistory();
  }, [userId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      console.log('Fetching payment history for user:', userId);

      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Payment history fetch error:', error);
        throw error;
      }

      console.log('Payment history data:', data);

      // Add debug logging for the table
      const { data: tableInfo } = await supabase
        .from('payment_history')
        .select('count');
      console.log('Total records in payment_history:', tableInfo);

      setPayments(data || []);
    } catch (err) {
      console.error('Error in fetchPaymentHistory:', err);
      // Include more error details in development
      setError(
        process.env.NODE_ENV === 'development'
          ? `Failed to fetch payment history: ${err instanceof Error ? err.message : String(err)}`
          : 'Failed to fetch payment history'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: Payment['status']) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('payment_history')
        .update({ status: newStatus })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Payment status updated');
      fetchPaymentHistory();
      onUpdate?.();
    } catch (err) {
      toast.error('Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGrantPosts = async (paymentId: string) => {
    setIsUpdating(true);
    try {
      // First get the current payment record
      const { data: payment, error: fetchError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (fetchError) throw fetchError;

      // Update the posts remaining
      const { error: updateError } = await supabase
        .from('payment_history')
        .update({
          posts_remaining: Math.max(0, (payment.posts_remaining || 0) - 1),
          // If posts are now 0, mark as inactive
          status: payment.posts_remaining <= 1 ? 'inactive' : 'active'
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      toast.success('Posts granted successfully');
      fetchPaymentHistory();
      onUpdate?.();
    } catch (err) {
      console.error('Error granting posts:', err);
      toast.error('Failed to grant posts');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading payment history...</div>;
  if (error) return <div className="text-red-600 py-4">Error: {error}</div>;
  if (!payments.length) return <div className="text-gray-500 py-4">No payment history found</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Intent ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posts Remaining
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(payment.created_at), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {payment.payment_intent_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${(payment.amount / 100).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {payment.posts_remaining}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${payment.status === 'active' ? 'bg-green-100 text-green-800' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                  {payment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                {payment.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleGrantPosts(payment.id)}
                      disabled={isUpdating}
                      className="text-primary hover:text-primary-dark disabled:opacity-50"
                    >
                      Grant Posts
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(payment.id, 'refunded')}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Mark Refunded
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


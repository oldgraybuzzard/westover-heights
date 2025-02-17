import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

interface Payment {
  id: string;
  amount: number;
  status: 'active' | 'cancelled' | 'refunded';
  created_at: string;
  payment_intent_id: string;
  posts_remaining: number;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadPayments() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('payment_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        console.error('Error loading payments:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-16">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/forum" className="text-gray-600 hover:text-primary flex items-center gap-2">
          <FaArrowLeft /> Back to Forum
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      {loading ? (
        <div className="text-gray-600">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">No payment history found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Payments will appear here after you make your first purchase.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
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
                        payment.status === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}